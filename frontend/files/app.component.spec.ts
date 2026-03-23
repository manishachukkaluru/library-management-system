import { TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { LoadingService } from "./core/services/api.services";
import { signal } from "@angular/core";

describe("AppComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
      providers: [
        { provide: LoadingService, useValue: { loading: signal(false) } },
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
