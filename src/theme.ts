import { createMuiTheme } from "@material-ui/core/styles";
import { Theme, ThemeOptions } from "@material-ui/core/styles/createMuiTheme";

// Imported in CSS in _app.tsx
const font = "'Questrial', sans-serif";

export enum ThemePaletteType {
  DARK = "dark",
  LIGHT = "light",
}

export enum AppColors {
  BLUE = "rgb(38,124,255)",
  PURPLE = "rgb(121,122,202)",
  RED = "rgb(200,30,35)",
  MAGENTA = "rgb(221,70,98)",
  YELLOW = "rgb(241,197,47)",
  IOS_LIGHT_BACKGROUND = "rgb(250,250,250)",
  IOS_DARK_BACKGROUND = "rgb(55,55,55)",
}

const baseTheme: ThemeOptions = {
  typography: {
    h1: {
      fontFamily: font,
    },
    h2: {
      fontFamily: font,
    },
    h3: {
      fontFamily: font,
    },
    h4: {
      fontFamily: font,
    },
    h5: {
      fontFamily: font,
    },
    h6: {
      fontFamily: font,
    },
    overline: {
      fontFamily: font,
    },
    button: {
      fontFamily: font,
    },
  },
  palette: {
    primary: {
      main: AppColors.BLUE,
    },
    secondary: {
      main: AppColors.IOS_DARK_BACKGROUND,
    },
    error: {
      main: AppColors.MAGENTA,
    },
  },
};

const iOSlightTheme: ThemeOptions = {
  palette: {
    type: "light",
    background: {
      default: AppColors.IOS_LIGHT_BACKGROUND,
    },
    primary: {
      main: AppColors.BLUE,
    },
    secondary: {
      main: AppColors.IOS_DARK_BACKGROUND,
    },
    error: {
      main: AppColors.MAGENTA,
    },
  },
};

const iOSDarkTheme: ThemeOptions = {
  palette: {
    type: "dark",
    background: {
      default: AppColors.IOS_DARK_BACKGROUND,
    },
    primary: {
      main: AppColors.BLUE,
    },
    secondary: {
      main: AppColors.IOS_LIGHT_BACKGROUND,
    },
    error: {
      main: AppColors.MAGENTA,
    },
  },
};

interface IThemeOptionsProvider {
  theme: Theme;
  setupListeners(callback: () => void): boolean;
}

class ThemeOptionsProvider implements IThemeOptionsProvider {
  /**
   *  Class that will have a dynamic Theme set up at .theme
   * - Currently theme is only based on Safari supported "prefers-color-scheme"
   */
  public theme: Theme;

  private themePaletteType: ThemePaletteType;

  constructor(
    private baseTheme: ThemeOptions = {},
    private lightTheme: ThemeOptions = {},
    private darkTheme: ThemeOptions = {},
    private defaultThemePaletteType: ThemePaletteType = ThemePaletteType.LIGHT,
    private callback?: () => void
  ) {
    this.themePaletteType = this.deduceThemePaletteType();
    this.theme = this.createMuiTheme();
  }

  public setupListeners = (callback: () => void) => {
    if (this.lightTheme === this.darkTheme) {
      console.info(
        "ThemeOptionsProvider:: Using same themes, not listening for updates"
      );
      return false;
    }
    this.callback = callback;
    if (typeof window !== "undefined" && window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addListener((e) => e.matches && this.updateTheme());
      window
        .matchMedia("(prefers-color-scheme: light)")
        .addListener((e) => e.matches && this.updateTheme());
      this.updateTheme();
      return true;
    }
    return false;
  };

  private updateTheme = () => {
    this.themePaletteType = this.deduceThemePaletteType();
    this.theme = this.createMuiTheme();
    if (this.callback) {
      this.callback();
    }
    console.info(
      "ThemeOptionsProvider:: updating theme to:",
      this.themePaletteType
    );
  };

  private createMuiTheme = () => {
    return createMuiTheme({ ...this.baseTheme, ...this.getThemePalette() });
  };

  private getThemePalette = () => {
    if (this.themePaletteType === ThemePaletteType.LIGHT) {
      return this.lightTheme;
    }
    if (this.themePaletteType === ThemePaletteType.DARK) {
      return this.darkTheme;
    }
    return {};
  };

  private deduceThemePaletteType = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
        .matches;
      const isLightMode = window.matchMedia("(prefers-color-scheme: light)")
        .matches;
      const isNotSpecified = window.matchMedia(
        "(prefers-color-scheme: no-preference)"
      ).matches;
      const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;

      if (isLightMode) {
        return ThemePaletteType.LIGHT;
      } else if (isDarkMode) {
        return ThemePaletteType.DARK;
      } else if (hasNoSupport) {
        return this.defaultThemePaletteType;
      }
    }
    return this.defaultThemePaletteType;
  };
}

const themeOptionsProvider = new ThemeOptionsProvider(
  baseTheme,
  iOSlightTheme,
  iOSDarkTheme
);

const alwayDarkThemeOptionsProvider = new ThemeOptionsProvider(
  baseTheme,
  iOSDarkTheme,
  iOSDarkTheme,
  ThemePaletteType.DARK
);

const alwayLightThemeOptionsProvider = new ThemeOptionsProvider(
  baseTheme,
  iOSlightTheme,
  iOSlightTheme,
  ThemePaletteType.LIGHT
);

export default alwayDarkThemeOptionsProvider;
