import { FontSizeOption } from "@/types";

export const fonts = {
  serif: "Lora_400Regular",
  serifBold: "Lora_600SemiBold",
  serifItalic: "Lora_400Regular_Italic",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemiBold: "Inter_600SemiBold",
};

// Body reading font sizes per user preference, in points, with matched line-height.
export const readingFontSizes: Record<FontSizeOption, { size: number; lineHeight: number }> = {
  P: { size: 16, lineHeight: 26 },
  M: { size: 18, lineHeight: 29 },
  G: { size: 21, lineHeight: 33 },
  GG: { size: 24, lineHeight: 37 },
};

export const type = {
  h1: { fontFamily: fonts.serifBold, fontSize: 28, lineHeight: 35 },
  h2: { fontFamily: fonts.serifBold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16 },
};
