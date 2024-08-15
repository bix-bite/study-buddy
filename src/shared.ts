export default class Shared {
  static formattedNow(): string {
    const now = new Date();

    const padStart = (value: number) => value.toString().padStart(2, '0');

    return (
      `${now.getFullYear()}${padStart(now.getMonth())}${padStart(now.getDate())}_` +
      `${padStart(now.getHours())}${padStart(now.getMinutes())}${padStart(now.getSeconds())}_` +
      `${now.getMilliseconds()}`
    );
  }
}
