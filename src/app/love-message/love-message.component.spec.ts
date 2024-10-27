import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoveMessageComponent } from './love-message.component';

describe('LoveMessageComponent', () => {
  let component: LoveMessageComponent;
  let fixture: ComponentFixture<LoveMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoveMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoveMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
