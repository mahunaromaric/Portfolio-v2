declare module "qrcode" {
  const QRCode: {
    toString(
      text: string,
      options?: {
        type?: "svg" | "utf8" | "terminal";
        margin?: number;
        width?: number;
        scale?: number;
        color?: { dark?: string; light?: string };
      },
    ): Promise<string>;
  };
  export default QRCode;
}
