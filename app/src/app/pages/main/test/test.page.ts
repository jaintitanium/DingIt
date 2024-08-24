import { Component, ViewChild } from '@angular/core';
import { ToastComponent } from '@app/components/toast/toast.component';
import { ApiService } from '@app/services/api.service';

@Component({
    selector: 'app-test',
    standalone: true,
    templateUrl: './test.page.html',
    styleUrl: './test.page.scss',
    imports: [ToastComponent]
})
export class TestPage {
  @ViewChild('toast') toast!: ToastComponent;

  constructor(private api: ApiService) {}

  async open() {
    // const { data: { user } } = await this.api.client().auth.getUser();
    // console.log(user);
    let session = await this.api.client().auth.getSession();
    console.log(session.data.session);
    this.toast.message("Really really really really really long toast message");
  }
}
