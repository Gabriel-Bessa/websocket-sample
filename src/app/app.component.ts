import {Component} from '@angular/core';
import * as Stomp from '@stomp/stompjs';
import {Client} from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Demo Websocket';
  description = 'Angular-WebSocket Demo';

  greetings: any = {};
  disabled = true;
  name: string;
  private stompClient: Client = null;

  constructor() {
  }

  setConnected(connected: boolean) {
    this.disabled = !connected;

    if (connected) {
      this.greetings = [];
    }
  }

  connect() {
    const socket = new SockJS(`/notification/api/socket`);
    this.stompClient = Stomp.over(socket);

    const _this = this;
    this.stompClient.connect({},  (frame) => {
      console.log("SeesionID: " + socket._transport.url.split('/')[socket._transport.url.split('/').length - 2])
      _this.setConnected(true);
      console.log('Connected: ' + frame);
      _this.getAll();
      _this.stompClient.subscribe(`/user/${1}/notification/messages`, function (data) {
        const parsedData = JSON.parse(data.body)
        _this.greetings = [];
        parsedData.content.forEach(i => _this.showGreeting(i))
      });
    }, function (data) {
      _this.disabled = true;
      _this.greetings = []
    });
  }

  disconnect() {
    if (this.stompClient != null) {
      this.stompClient.disconnect();
    }

    this.setConnected(false);
    console.log('Disconnected!');
  }

  getAll() {
    this.stompClient.send(`/messages/all`,
      {"Content-Type": "application/json"},
      JSON.stringify({size: 10, page: 0})
    );
  }


  sendName(id: number) {
    this.stompClient.send(`/messages/${id}/read`,
      {},
      JSON.stringify({'unreadMessages': true})
    );
  }

  showGreeting(message) {
    this.greetings.push(message);
  }

  readMessage(message) {
    const _this = this;
    this.stompClient.subscribe(`/messages/${message.id}/read`, function (data) {
        _this.greetings = []
        const parsedData = JSON.parse(data.body)
        parsedData.content.forEach(i => _this.showGreeting(i))
      },
      {})
  }
}
