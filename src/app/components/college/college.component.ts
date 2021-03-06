import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { CollegeRegistrationComponent } from '../college-registration/college-registration.component';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { AuthenticationService } from 'src/app/service/authentecation.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-college',
  templateUrl: './college.component.html',
  styleUrls: ['./college.component.scss']
})
export class CollegeComponent implements OnInit {

  constructor(
    private bsModalService: BsModalService,
    private configurationService: ConfigurationService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public authenticationService: AuthenticationService) { }

  toggle = false;
  loading = false;
  listEnd = true;
  collegeList = [];
  totalCount = 0;
  pageNo = 1;
  searchKey = '';
  pageSize = 10;

  ngOnInit() {
    this.get();
  }
  toggleSideMenu(event) {
    this.toggle = !this.toggle;
  }
  search(searchKey): void {
    this.searchKey = searchKey;
    this.pageNo = 1;
    this.loading = true;
    this.get();
  }
  get(): void {
    this.loading = true;
    const req = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      searchKey: this.searchKey,
      active: true};
    this.configurationService.getCollegeList(req).subscribe(
      (response) => {
        this.loading = false;
        if (response['status'] === 'success') {
                if (req.pageNo === 1) {
                  this.collegeList = [...response['object']['collegeVoList']];
                  this.totalCount = response['object']['count'];
                } else {
                  this.collegeList = [...this.collegeList, ...response['object']['collegeVoList']];
                }
                if ((req.pageNo * req.pageSize) >= this.totalCount) {
                   this.listEnd = true;
                } else {
                  this.listEnd = false;
                }
        }
      }
    );
  }

  add(): void {
    const configuartion = {
      initialState : {
        title: 'College Registration Form'
      },
      class: 'modal-lg'
    };
    this.bsModalService.show(CollegeRegistrationComponent, configuartion)
    .content
    .submit$
    .subscribe(
      (request) => {
        this.configurationService.createCollege(request).subscribe(
          (response) => {
            if (response['status'] === 'success') {
              this.collegeList = [];
              this.pageNo = 1;
              this.get();
              this.bsModalService.hide(1);
              this.renderer.removeClass(this.document.body, 'modal-open');
            }
          }
        );
      }
    );
  }

  edit(selectedCollege): void {
    const configuartion = {
      initialState : {
        title: 'College Update Form',
        selectedCollege: selectedCollege
      },
      class: 'modal-lg'
    };
    this.bsModalService.show(CollegeRegistrationComponent, configuartion)
    .content
    .submit$
    .subscribe(
      (request) => {
        this.configurationService.updateCollege(request).subscribe(
          (response) => {
            this.collegeList = [];
            this.pageNo = 1;
            this.get();
            this.bsModalService.hide(1);
            this.renderer.removeClass(this.document.body, 'modal-open');
          }
        );
      }
    );
  }



  delete(selectedCollege): void {


    const configuartion = {
      initialState : {
        title: 'Delete College'
      },
      class: 'modal-sm'
    };
    this.bsModalService.show(DeleteConfirmationComponent, configuartion)
    .content
    .submit$
    .subscribe(
      (confirm) => {
           if (confirm) {
             const request = { ...selectedCollege, active: false };
            this.configurationService.updateCollege(request).subscribe(
              (response) => {
                this.get();
              }
            );
           }
           this.bsModalService.hide(1);
           this.renderer.removeClass(this.document.body, 'modal-open');
      }
    );
  }

  loadMore() {
    this.pageNo += 1;
    this.get();
  }

}
