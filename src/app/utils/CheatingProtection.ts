import {getCookie, setCookie} from './cookies'
import { Router } from '@angular/router';

export class BlurSpy {
  onBlur: Function = () => {
  };
  onMaxBlurs: Function = () => {
  };
  onFocusRestore: Function = () => {};
  maxBlursCount = Number.POSITIVE_INFINITY;

  blursCount = 0;

  isBlurred = false;
  lastFocus: number = 0;
  blurMonitor: number | null = null;

  constructor(onBlur: Function, onMaxBlurs: Function, onFocusRestore: Function, maxBlurs: number) {
    this.onBlur = onBlur;
    this.onMaxBlurs = onMaxBlurs;
    this.onFocusRestore = onFocusRestore;
    this.maxBlursCount = maxBlurs;
    this.blursCount = this.getBlursCount()
  }

  monitorId: string | null = null;
  start(allowedMargin: number = 250, focusId: string | null = 'focus_exam') {
    this.monitorId = focusId
    this.isBlurred = false;
    const handleBlur = () => {
      this.isBlurred = true;
      this.blursCount++;
      setCookie("blurs", this.blursCount, 1000 * 60 * 60 * 2);
      this.onBlur();
      if (this.maxBlursCount >= 0 && this.blursCount > this.maxBlursCount) {
        this.onMaxBlurs();
      }
    };
    const focusMonitoring = ()=> {
      this.blurMonitor = window.setInterval(() => {
        if (document.hasFocus()) {
          if (this.isBlurred) {
            this.onFocusRestore();
          }
          const timestamp = (new Date()).getTime();
          this.lastFocus = timestamp;
          this.isBlurred = false;
          if (focusId && localStorage) {
            localStorage.setItem(focusId, String(timestamp));
          }
          return
        }
        const z = (((new Date()).getTime() - this.lastFocus) > allowedMargin);
        if (z && !this.isBlurred) handleBlur();
      }, 100);
    }

    // Handle blur on page refresh
    if (focusId && localStorage) {
      const currentData = localStorage.getItem(focusId);
      if (currentData) {
        try {
          this.lastFocus = parseInt(currentData);
          if ((new Date()).getTime() - this.lastFocus > 3 * allowedMargin) {
            handleBlur();
          }
        } catch (t) {
        }
      }
    }
    window.focus();
    if (document.hasFocus()) focusMonitoring();
    else {
      window.addEventListener("focus", function () {
        if (document.hasFocus()) focusMonitoring();
      }, {
        once: true,
      });
    }
    if (this.lastFocus == null) {
      this.lastFocus = (new Date()).getTime();
    }
  }
  stop() {
    if (this.blurMonitor) {
      clearInterval(this.blurMonitor);
      if (this.monitorId && localStorage) {
        localStorage.removeItem(this.monitorId);
      }
      this.blurMonitor = null;
    }
  }

  getBlursCount() {
    const cookie = getCookie("blurs");
    if (cookie == null || cookie == "") {
      return 0;
    }
    const blurs = parseInt(cookie);
    if (isNaN(blurs)) return 0;
    return blurs;
  }
}

export class TemperChecker {
  obj = Object.prototype.toString;
  fn = Function.prototype.toString;
  objRegex = /^\[object .+?Constructor]$/;
  fnRegex = RegExp(
    "^" +
    // @ts-ignore
    String(Function.prototype.ots)
      .replace(/[.*+?^${}()|[\]\/\\]/g, "\\$&")
      .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\])/g, "$1.*?") +
    "$"
  );

  router!: Router;
  checkerTimer: number | null = null;

  checksStatus: {
    [key: string]: boolean
  } = {
    'RegExp - test': true,
    'window - setInterval': true,
    'document - hasFocus': true
  }

  constructor(router: Router) {
    console.log('TemperChecker initialized');
    this.router = router;
    this.checkTemperingWithBrowser = this.checkTemperingWithBrowser.bind(this);

    this.checkTemperingWithBrowser();
    this.checkerTimer = window.setInterval(this.checkTemperingWithBrowser, 1000);
  }

  stop() {
    if (this.checkerTimer) {
      clearInterval(this.checkerTimer);
    }
  }

  checkTemperingWithBrowser() {
    return this.check() ? false : this.redirect();
  }

  check() {
    try {
      this.checksStatus['RegExp - test'] = this.fn.call(Set).replace('Set', 'test') === this.fn.call(RegExp.prototype.test);
    }
    catch (e) {
      console.error(e);
      this.checksStatus['RegExp - test'] = false;
    }
    try {
      this.checksStatus['document - hasFocus'] = this.checker(document.hasFocus);
    }
    catch (e) {
      console.error(e);
      this.checksStatus['document - hasFocus'] = false;
    }
    try {
      this.checksStatus['window - setInterval'] = this.checker(window.setInterval);
    }
    catch (e) {
      console.error(e);
      this.checksStatus['window - setInterval'] = false;
    }
    try {
      this.checksStatus['window - onblur'] = window.onblur == null;
    }
    catch (e) {
      console.error(e);
      this.checksStatus['window - onblur'] = false;
    }

    return this.checksStatus['RegExp - test']
        && this.checksStatus['window - setInterval']
        && this.checksStatus['document - hasFocus']
        && this.checksStatus['window - onblur'];
  }

  redirect() {
    this.stop();
    // @ts-ignore
    window.temperingChecks = this.checksStatus;
    this.router.navigate(['/niekompatybilna-przegladarka'], {skipLocationChange: true});
  }

  checker(testObject: any) {
    try {
      const testObjectType = typeof testObject;
      return testObjectType == 'function'
        ? this.fnRegex.test(this.fn.call(testObject))
        : (testObject && (testObjectType == "object") && this.objRegex.test(this.obj.call(testObject)));
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
