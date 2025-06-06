export function getCookie(cookieName: string) {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let name = cookies[i].slice(0, cookies[i].indexOf("="));
    let value = cookies[i].slice(cookies[i].indexOf("=") + 1);
    name = name.replace(/^\s+|\s+$/g, "");
    if (name == cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
export function setCookie(name: string, value: string | number, expires: number, path: string | undefined = undefined) {
  if (path) {
    const expireDate = new Date();
    expireDate.setMilliseconds(expireDate.getMilliseconds() + expires);
    const cookieBody = encodeURIComponent(value) + (expires == null ? "" : "; expires=" + expireDate.toUTCString()) + "; path=" + path + "; SameSite=None; Secure";
    document.cookie = name + "=" + cookieBody;
  } else {
    setCookieNoPath(name, value, expires);
  }
}
export function setCookieNoPath(name: string, value: string | number, expires: number) {
  const f = new Date();
  f.setMilliseconds(f.getMilliseconds() + expires);
  const cookieBody = encodeURIComponent(value) + (expires == null ? "" : "; expires=" + f.toUTCString()) + "; SameSite=None; Secure";
  document.cookie = name + "=" + cookieBody;
}
export function eraseCookie(name: string) {
  setCookie(name, "", -10000);
}
