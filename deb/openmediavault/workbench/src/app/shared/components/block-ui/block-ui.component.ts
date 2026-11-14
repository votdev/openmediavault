import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BlockUiService } from '~/app/shared/services/block-ui.service';

@Component({
  selector: 'omv-block-ui',
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class BlockUiComponent {
  constructor(public blockUiService: BlockUiService) {}
}
