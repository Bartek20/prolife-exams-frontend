export function copyToClipboard(text: string) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, -1);
  document.execCommand('copy');
  document.body.removeChild(input);
}
