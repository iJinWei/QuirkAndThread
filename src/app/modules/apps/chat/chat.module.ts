import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { PrivateChatComponent } from './private-chat/private-chat.component';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { DrawerChatComponent } from './drawer-chat/drawer-chat.component';
import {
  DropdownMenusModule,
  ChatInnerModule,
  CardsModule,
} from '../../../_metronic/partials';
import {SharedModule} from "../../../_metronic/shared/shared.module";

@NgModule({
  declarations: [
    ChatComponent,
    PrivateChatComponent,
    GroupChatComponent,
    DrawerChatComponent,
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    DropdownMenusModule,
    ChatInnerModule,
    CardsModule,
    SharedModule,
  ],
})
export class ChatModule {}
