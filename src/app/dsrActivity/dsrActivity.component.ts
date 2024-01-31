import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { DataService } from '../services/data.service';
import { ExcelexportService } from '../services/excelexport.service';
import { ToastService } from '../services/components/toast.service';
import { LoderService } from '../services/components//loder.service';
import { CommonService } from '../services/common.service';
import { TimeDurationService } from '../services/time-duration.service';
import * as XLSX from 'xlsx';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth/authentication.service';
import { IonicSelectableComponent } from 'ionic-selectable';
class Banks {
  public bank_Name: string;
}
class BankBranchName {
  public bankBranchName: string;
}
@Component({
  selector: 'app-dsrActivity',
  templateUrl: './dsrActivity.component.html',
  styleUrls: ['./dsrActivity.component.scss'],
})
export class DsrActivityComponent implements OnInit {
  titleMsg = "DAR Activity";
  userName: any;
  userEmpCode: any;
  drsFrom: FormGroup;
  managerForm: FormGroup;
  filterForm: FormGroup;
  submitted = false;
  dsrDetails: boolean = true;
  dsrActivityAdd: boolean = false;
  searchBar: boolean = false;
  emptyRecord: boolean = true;
  startTime: any;
  endTime: any;
  Duration: any;
  subDurations: any;
  startTimes: any;
  openFilter: boolean = false;
  startDate: any;
  endDate: any;
  filterSearch = '';
  filterData: any = [];
  userFlag: any;
  authTl: any;
  userZone: any;
  segmentValue: any = "zone";
  ExecutiveName: string;
  userData: any;
  end_Time_picker: boolean = true;
  PremiumFooter: boolean = true;
  totalPremium: any;
  managerData: any;
  // banks: any=[];
  charCheck: any;
  minDate;
  maxDate;
  zoneData: any;
  clanderDate: Date;
  subTypeActivityArr = [];
  TypeActivity: any = [
    { flag: 'Y', typeOfActivity: "Recruitment Call" },
    { flag: 'N', typeOfActivity: "Policy Inward" },
    { flag: 'N', typeOfActivity: "Sales Call" },
    { flag: 'N', typeOfActivity: "Customer Claim Service" },
    { flag: 'N', typeOfActivity: "Promotional activity" },
    { flag: 'Y', typeOfActivity: "Joint call with supevisor" },
    { flag: 'Y', typeOfActivity: "Agent Meeting" },
    { flag: 'N', typeOfActivity: "Review/Office Meeting/Other Back office work" }
  ];

  subTypeActivity: any = [
    { typeOfActivity: "Recruitment Call", subActivity: 'Career Opportunity Presentation' },
    { typeOfActivity: "Recruitment Call", subActivity: 'Document collection/ Rec. tool submission' },
    { typeOfActivity: "Recruitment Call", subActivity: 'Training' },
    { typeOfActivity: "Recruitment Call", subActivity: 'Exam Scheduling' },
    { typeOfActivity: "Joint call with supevisor", subActivity: 'Sales Call ' },
    { typeOfActivity: "Joint call with supevisor", subActivity: 'Agent meeting ' },
    { typeOfActivity: "Joint call with supevisor", subActivity: 'Recruitment Call' },
    { typeOfActivity: "Agent Meeting", subActivity: 'Discussion on' },

  ];

  constructor(
    private fb: FormBuilder, private dataService: DataService,
    public popoverController: PopoverController,
    public toastService: ToastService,
    private excelexportService: ExcelexportService,
    private loderService: LoderService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private authanticationSer: AuthenticationService,
    public router: Router,
  ) {
  }


  ngOnInit() {
    this.subTypeActivityArr = this.subTypeActivity;
    this.getUserName();
    // this.getBanks();
    this.getDSRActivityData();
    this.getTotalPremium();
    this.minMaxDate();
    this.drsFrom = this.fb.group({
      executive: ['', Validators.required],
      team_Leader: ['', Validators.required],
      auth_role: ['', Validators.required],
      userName: ['', Validators.required],
      zone: ['', Validators.required],
      date_Of_Visit: ['', Validators.required],
      start_Time: ['', Validators.required],
      end_Time: ['', Validators.required],
      duration: ['', Validators.required],
      type_Of_Activity: ['', Validators.required],
      subTypeOfActivity: this.fb.array([]),
      email: ['', Validators.required],
      meet_Location: ['', Validators.required],
      agentName: ['', [Validators.required]],
      // branch_Code: ['12345'],
      // bank_Branch_Name: ['', Validators.required],
      // mode_Of_Transport: [''],
      // travel_From: [''],
      // travel_To: [''],
      // kilometers_Travelled: [''],
      // to_Whom_Meet: ['',Validators.compose([Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9  !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~€£¥₩])(?=.*?[A-Z 0-9]).{8,}$"), Validators.required])],
      to_Whom_Meet: ['', Validators.required],
      to_Whom_Meet_Number: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"), Validators.maxLength(10)]],
      remark_Comments: ['', Validators.required]
    });

    this.filterForm = this.fb.group({
      zone: ['', Validators.required],
      startDate: [''],
      activity: [''],
      endDate: ['']
    });

    this.managerForm = this.fb.group({
      zone: ['', [Validators.required]],
      manager: ['', [Validators.required]],
    });
  }



  changeTypeOfActivity(e: any, f) {
    // console.log("flag",f);
    // this.subTypeActivityArr = []
    // var final = [];
    // var d = this.subTypeActivity.filter((item) => {
    //   console.log("item",item)
    //   if (e.target.value == item.typeOfActivity) {
    //     final.push(item);
    //     return;
    //   } else {
    //     final=[...this.subTypeActivity];
    //   }
    // })
    // this.subTypeActivityArr = final;

    // console.log(final)
    // console.log("dddd", d);
    this.getSubTypeOfActivity(e.target.value)
  }


  getSubTypeOfActivity(activityName: any) {
    this.commonService.post('getDSRSubtypeOfActivity', { type_Of_Activity: activityName }).subscribe((res) => {
      if (res.ResponseFlag == 1) {
        var d = JSON.parse(res.ResponseMessage).Table;
        this.subTypeActivityArr = d;
        console.log("DSRSubtypeOfActivity", d)
      } else {
        console.log("DSRSubtypeOfActivity not found");
      }
    }), (err) => {
      console.log("error", err);
    }
  }


  dateClanderChange(e: any) {
    this.clanderDate = e.target.value;
    console.log("date change ", this.clanderDate);
  }

  bankLoad() {
    let loadingParams = { msg: 'Please Wait...', spinner: 'lines-sharp-small', mode: 'ios', class: 'custom-loading', backdropDismiss: true }

    setTimeout(() => {
      this.loderService.dismiss();
    }, 1000);
  }


  getZone() {
    this.commonService.post('DSRLogin', { userName: this.userEmpCode }).subscribe((res) => {
      if (res.ResponseFlag == 1) {
        let zone = JSON.parse(res.ResponseMessage).Table[0];
        this.drsFrom.get('zone').setValue(zone);
        // console.log("zone data", zone);
      } else {
        this.toastService.toast("Zone Not Found");
      }
    })
  }

  chngeZone(e) {
    this.submitted = true;
    let zone = e.target.value;
    if (zone.length != 0) {

      let loadingParams = { msg: 'Please Wait...', spinner: 'lines-sharp-small', mode: 'ios', class: 'custom-loading', backdropDismiss: true }
      //this.loderService.showLoading(loadingParams);
      this.commonService.post('getLeaderDtlsWithZone', { userName: this.userEmpCode, zones: zone }).subscribe((res) => {
        if (res.ResponseFlag == 1) {
          this.loderService.dismiss();
          this.managerData = JSON.parse(res.ResponseMessage).Table;
          if (this.managerData.length == 0) {
            this.toastService.toast("Manager Not Found.!!");
          }
          // console.log("Managers ", this.managerData);
        } else {
          this.loderService.dismiss();
          this.toastService.toast("Manager Not Found");
        }
      })
    }
  }


  chngeManagers(e) {
    this.submitted = true;
    let manager = e.target.value;
    if (manager.length != 0) {
      let loadingParams = { msg: 'Please Wait...', spinner: 'lines-sharp-small', mode: 'ios', class: 'custom-loading', backdropDismiss: true }
      //this.loderService.showLoading(loadingParams);
      this.commonService.post('ZoneManagerfilters', { zone: [], manager: manager }).subscribe((res) => {
        if (res.ResponseFlag == 1) {
          let data = JSON.parse(res.ResponseMessage).Table;
          for (let i = 0; i < data.length; i++) {
            if (data[i].subTypeOfActivity.length > 10) {
              data[i].subTypeOfActivity = JSON.parse(data[i].subTypeOfActivity);
              // console.log("sub data", data[i].subTypeOfActivity);
            } else {
              data[i].subTypeOfActivity = [];
            }
          }
          this.filterData = data;
          // console.log("dsr data", data);
          this.loderService.dismiss();
        } else {
          this.loderService.dismiss();
          this.toastService.toast("Data Not Found");
        }
      }, (err) => {
        console.log(err, "error");
      })
    }

  }

  getUserName() {
    this.route.queryParamMap.subscribe((params: any) => {
      if (params.params.item) {
        let item = JSON.parse(params.params.item);
        this.userEmpCode = item;
        // this.userFlag = item.flag;
        // console.log("url data", item);
        // this.getDSRActivityData();
      } else {
        const get = this.authanticationSer.getSession('authData');
        this.userData = JSON.parse(atob(get));
        // this.userData = this.authanticationSer.getSession('authData');
        this.userEmpCode = this.userData.EmpCode;
        this.userFlag = this.userData.flag;
        this.userZone = this.userData.zone;
        // console.log("else user id", this.userName);
      }
    });
  }

  applyFilters() {
    let formData = this.filterForm.value;
    if (this.filterForm.valid) {

      let frmData = {
        userId: this.userEmpCode,
        zone: formData.zone ? formData.zone : [],
        activity: formData.activity ? formData.activity : [],
        startDate: formData.startDate ? formData.startDate : "",
        endDate: formData.endDate ? formData.endDate : ""
      }

      this.commonService.post('dSRFilter', frmData).subscribe((res) => {
        if (res.ResponseFlag == 1) {
          let data = JSON.parse(res.ResponseMessage).Table;
          for (let i = 0; i < data.length; i++) {
            if (data[i].subTypeOfActivity.length > 10) {
              data[i].subTypeOfActivity = JSON.parse(data[i].subTypeOfActivity);
              // console.log("sub data", data[i].subTypeOfActivity);
            } else {
              data[i].subTypeOfActivity = [];
            }
          }
          this.loderService.dismiss();
          this.filterData = data;
          // console.log("api filter data", data);
        } else {
          console.log("No Record Found ");
          this.loderService.dismiss();
          this.toastService.toast("No Record Found ");
        }
      }, (err) => {
        console.log(err, "error");
      }
      )
    } else {
      this.toastService.toast("Zone is required");
    }
  }

  doRefresh(event) {
    setTimeout(() => {
      this.ngOnInit();
      event.target.complete();
    }, 4000);
  }

  getDSRActivityData() {
    this.loderService.loaderStatus.next(true);
    this.commonService.post('getDSRdtls', { userName: this.userEmpCode }).subscribe((res) => {
      this.loderService.loaderStatus.next(false);
      if (res.ResponseFlag == 1) {

        let data = JSON.parse(res.ResponseMessage).Table;
        for (let i = 0; i < data.length; i++) {
          if (data[i].subTypeOfActivity.length > 10) {
            data[i].subTypeOfActivity = JSON.parse(data[i].subTypeOfActivity);
            // console.log("sub data", data[i].subTypeOfActivity);
          } else {
            data[i].subTypeOfActivity = [];
          }
        }
        this.filterData = data;
        // console.log("dsr data", this.filterData);
      } else {
        // this.loderService.dismiss();
        this.loderService.loaderStatus.next(false);
      }
    }, (err) => {
      console.log(err, "error");
      // this.loderService.dismiss();
      this.loderService.loaderStatus.next(false);
    })
  }


  subTypeOfActivity() {
    return this.drsFrom.get("subTypeOfActivity") as FormArray
  }

  newSubTypeOfActivity() {
    return this.fb.group({
      subTypeOfActivity: ['', [Validators.required]],
      subStartTime: ['11:10:00'],
      subEndTime: ['11:15:00'],
      subDuration: ['00:05'],
      premium_Collected: ['', [Validators.required]],
    })
  }

  addSubTypeOfActivity() {
    this.subTypeOfActivity().push(this.newSubTypeOfActivity());
  }

  removeSubTypeActivity(i) {
    this.subTypeOfActivity().removeAt(i);
  }

  startTimeChange(e) {
    // console.log("start time", e.target.value);
    this.startTime = e.target.value;
    this.end_Time_picker = false;
    if (this.endTime >= this.startTime) {
      var ms = moment(this.endTime, "HH:mm").diff(moment(this.startTime, "HH:mm"));
      var d = moment.duration(ms);
      this.Duration = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
      // console.log("change duration", this.Duration);
    } else {
      if (this.endTime <= this.startTime) {
        this.toastService.toast("End time should be greater than start time");
        // console.log("time not match");
      }
    }
    // console.log("chesk start time and end time", this.startTime, this.endTime);
  }

  endTimeChange(e) {
    this.endTime = e.target.value;
    if (this.endTime >= this.startTime) {
      var ms = moment(this.endTime, "HH:mm").diff(moment(this.startTime, "HH:mm"));
      var d = moment.duration(ms);
      this.Duration = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
      // console.log("correct", this.Duration);
    } else {
      this.toastService.toast("End time should be greater than start time, , Select another time");
      // console.log("wrong");
    }
  }

  substartTimeChange(e) {
    // console.log("start time", e.target.value);
    this.startTime = e.target.value;
    this.end_Time_picker = false;
    if (this.endTime >= this.startTime) {
      var ms = moment(this.endTime, "HH:mm").diff(moment(this.startTime, "HH:mm"));
      var d = moment.duration(ms);
      this.Duration = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
      // console.log("change duration", this.Duration);
    } else {
      if (this.endTime <= this.startTime) {
        this.toastService.toast("End time should be greater than start time");
        // console.log("time not match");
      }
    }
    // console.log("chesk start time and end time", this.startTime, this.endTime);
  }

  subendTimeChange(e, activity) {
    this.endTime = e.target.value;
    if (this.endTime >= this.startTime) {
      var ms = moment(this.endTime, "HH:mm").diff(moment(this.startTime, "HH:mm"));
      var d = moment.duration(ms);
      let duration = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
      activity.controls['subDuration'].setValue(duration);
      // console.log("correct", this.Duration);
    } else {
      this.toastService.toast("End time should be greater than start time, , Select another time");
      // console.log("wrong");
    }
  }

  searchData() {
    var result = this.filterData.filter(a => {
      var data = a.date;
      return data;
    });
    if (result.length > 0) {
      this.filterData = result;
      // console.log("data is comeing", this.filterData)
    } else {
      this.filterData = this.filterData;
    }
  }

  AddDsrActivity() {
    const get = this.authanticationSer.getSession('authData');
    this.userData = JSON.parse(atob(get));

    this.userFlag = this.userData.flag;
    this.authTl = this.userData.ReportingManager1Empcode;
    this.ExecutiveName = this.userData.EmpName;
    this.userEmpCode = this.userData.EmpCode;
    this.userZone = this.userData.zone;

    this.drsFrom.get('executive').setValue(this.ExecutiveName);
    this.drsFrom.get('team_Leader').setValue(this.authTl);
    this.drsFrom.get('auth_role').setValue(this.userFlag);
    this.drsFrom.get('userName').setValue(this.userEmpCode);
    this.drsFrom.get('zone').setValue(this.userZone);

    this.PremiumFooter = false;
    this.dsrActivityAdd = true;
    this.dsrDetails = !this.dsrDetails;
    this.openFilter = false;
    this.searchBar = false;
    this.emptyRecord = !this.emptyRecord;
  }
  closeAddActivity() {
    this.dsrDetails = true;
    this.dsrActivityAdd = false;
    this.PremiumFooter = this.PremiumFooter == true ? false : true;
  }


  onSubmit() {
    if (this.drsFrom.invalid) {
      // this.toastService.toast("Please check mandatory fields and can not use special character & symbols");
    }
    this.submitted = true;
    let obj = this.drsFrom.value;
    console.log("add data", obj);
    if (this.drsFrom.valid) {
      this.commonService.post('addDSRdtls', obj).subscribe(res => {
        this.getTotalPremium();
        this.toastService.toast("DSR activity data has been saved successfully !");
        this.drsFrom.reset();
        this.dsrActivityAdd = false;
        this.dsrDetails = true;
        this.openFilter = false;
        this.PremiumFooter = this.PremiumFooter == true ? false : true;
        this.getDSRActivityData();
      })
    }
  }

  getTotalPremium() {
    this.commonService.post('getTotalPremium', { '': '' }).subscribe((res) => {
      if (res.ResponseFlag == 1) {
        this.totalPremium = JSON.parse(res.ResponseMessage).Table[0].TotalPremium;
        // this.totalPremium = JSON.parse(res.ResponseMessage).Table[0];
      } else {
        // console.log("Total Premium not found");
      }
    }), (err) => {
      // console.log("error", err);
    }
  }

  filterSubmit() {
    this.submitted = true;
    var data = this.filterForm.value;
    var startDate = data.startDate;
    var endDate = data.endDate;
    var result = this.filterData.filter(a => {
      var date = a.date_Of_Visit;
      return (date >= startDate && date <= endDate);
    });
    if (result.length > 0) {
      this.filterData = result;
    } else {
      this.filterData = this.filterData;
    }
  }

  minMaxDate() {
    var date = new Date();
    var datestrings = (date.getFullYear()) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    this.maxDate = datestrings;
    var tempDate = new Date(date.setDate(date.getDate() - 1));
    var minDateString = (tempDate.getFullYear()) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + tempDate.getDate()).slice(-2);
    this.minDate = minDateString;
  }

  clearFilterForm() {
    this.filterForm.reset();
    this.getDSRActivityData();
    this.getZones();
  }

  clearManagerFilter() {
    this.managerForm.reset();
    this.getUserName();
    this.getDSRActivityData();
    this.getZones();
  }

  filterClose() {
    this.openFilter = false;
    this.PremiumFooter = this.PremiumFooter == true ? false : true;
  }

  filterOpen() {
    this.searchBar = false;
    this.openFilter = !this.openFilter;
    this.PremiumFooter = this.PremiumFooter == true ? false : false;
    this.dsrDetails = true;
    this.dsrActivityAdd = false;
    if (this.userFlag <= 1) {
      this.segmentValue = "zone";
      // console.log("zone here");
    }
    else {
      this.segmentValue = "manager";
      // console.log("manager here");
    }
    this.getZones();
  }

  getZones() {
    let loadingParams = { msg: 'Please Wait...', spinner: 'lines-sharp-small', mode: 'ios', class: 'custom-loading', backdropDismiss: true }
    // this.loderService.showLoading(loadingParams);
    this.commonService.post('getDSRZone', { userName: this.userEmpCode }).subscribe((res) => {
      if (res.ResponseFlag == 1) {
        // this.loderService.dismiss();
        this.zoneData = JSON.parse(res.ResponseMessage).Table;
      } else {
        // this.loderService.dismiss();
        this.toastService.toast("Zone Not Found");
      }
    })
  }

  excelExport(tblId: any) {
    let d = this.excelexportService.exportExcel(tblId, 'DSR-Activity');
    // console.log("xl", d);
  }

  segmentChanged(e) {
    this.segmentValue = e.target.value;
  }




  searchIcon() {
    this.dsrActivityAdd = false;
    this.dsrDetails = true;
    this.searchBar = !this.searchBar;
    this.openFilter = false;
    this.PremiumFooter = false;
  }

  checkSpaicelChar(event: any) {
    var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (format.test(event.target.value) == true) {
      let controlName = event.srcElement.attributes.formcontrolname.nodeValue;
      this.drsFrom.get(`${controlName}`).setValidators([Validators.required]);
      this.toastService.toast('can not use special character & symbols');
      return true
    } else {
      return false
    }
  }



  backButton() {
    history.back();
  }
}
