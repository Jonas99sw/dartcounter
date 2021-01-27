import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigGamePage } from './config-game.page';

describe('ConfigGamePage', () => {
  let component: ConfigGamePage;
  let fixture: ComponentFixture<ConfigGamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigGamePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
