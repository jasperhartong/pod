/* eslint-disable */

type LoadImageError = {
    status: string;
    data: any;
}

type PointerEventsPolyfillScope = "root" | "document";

type ResizeMode = "force" | "cover" | "contain";

type Position = {
    x: number;
    y: number;
};

type Flip = {
    horizontal: boolean;
    vertical: boolean;
};

type Crop = {
    center?: Position;
    zoom?: number;
    rotation?: number;
    aspectRatio?: number;
    flip?: Flip;
};

type DokaUpdate = {
    crop: Crop & Size;
};

type DokaData = {
    crop: Crop;
    image: {
        orientation: number;
    };
    size: {
        mode: ResizeMode;
        upscale: boolean;
        width: number;
        height: number;
    };
    output: {
        type: string;
        quality: number;
    };
};

type DokaImageOptions = {
    crop: Crop;
};

type AspectRatioOption = {
    label: string;
    value: number | string | Size | null;
};

type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type Size = {
    width: number;
    height: number;
};

type SetInnerHTML = (element: SVGElement, html: string) => string;

type CropMaskUpdate = (insetRect: Rect, maskSize: Size) => void;

type UtilNames = "crop" | "filter" | "color" | "markup" | "resize";

type StyleLayoutModes = "preview" | "modal";

type FullscreenSafeAreaOptions = "bottom" | "none";

type StyleCornerOptions = "circle" | "line";

type ColorMatrix = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];

type Range = [number, number];

type Filter = {
    label: string;
    matrix: () => ColorMatrix;
};

type Filters = {
    [name: string]: Filter;
};

type Color = string;

type MarkupUnit = number | string;

type MarkupLineDecoration = "arrow-end" | "arrow-begin";

type MarkupShape = {

    // position
    left?: MarkupUnit;
    top?: MarkupUnit;
    x?: MarkupUnit;
    y?: MarkupUnit;
    width?: MarkupUnit;
    height?: MarkupUnit;
    right?: MarkupUnit;
    bottom?: MarkupUnit;

    // visibility
    opacity?: number;

    // border
    borderColor?: Color;
    borderWidth?: MarkupUnit;
    borderStyle?: MarkupUnit[];

    // background
    backgroundColor?: Color;

    // line
    lineWidth?: MarkupUnit;
    lineCap?: "butt" | "round" | "square";
    lineJoin?: "butt" | "round" | "square";
    lineStyle?: MarkupUnit[];
    lineDecoration?: MarkupLineDecoration[];

    // text
    fontColor?: Color;
    fontWeight?: string|number;
    fontFamily?: string;
    textAlign?: "left" | "center" | "right";
    text?: string;

    // image
    src?: "string";
    fit?: "contain" | "cover" | "force";

    // bools
    allowDestroy?: boolean;
    allowSelect?: boolean;
    allowMove?: boolean;
    allowResize?: boolean;
    allowInput?: boolean;
    allowEdit?: boolean | MarkupOption[];
};

type MarkupOption =
  | "fontFamily"
  | "fontSize"
  | "fontWeight"
  | "textAlign"
  | "backgroundColor"
  | "fontColor"
  | "borderColor"
  | "borderWidth"
  | "borderStyle"
  | "lineColor"
  | "lineWidth"
  | "lineDecoration"
  | "lineJoin"
  | "lineCap";
type MarkupType = "rect" | "ellipse" | "image" | "line" | "text";
type MarkupShapeOption = [MarkupType, MarkupShape];
type MarkupFontSizeOption = [string, number];
type MarkupFontFamilyOption = [string, string];
type MarkupShapeStyleOption = [string, number, number[]|null, number];
type MarkupLineStyleOption = [string, number, number[]|null, number];
type MarkupLineDecorationOption = [string, MarkupLineDecoration[]];
type MarkupColorOption = [string, string, string?];

type DokaImageSource = string|File|Blob|HTMLImageElement|HTMLCanvasElement;

type EXIFOrientation = -1 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type DokaImage = {
    width: number;
    height: number;
    name: string;
    size: number;
    type: string;
    orientation: EXIFOrientation;
};

interface IDokaOptions {

    id?: string;
    className?: string;
    storageName?: string;

    src?: DokaImageSource;
    utils?: UtilNames[];
    util?: string;

    maxImagePreviewWidth?: number;
    maxImagePreviewHeight?: number;

    imagePreviewScaleMode?: 'stage'| 'crop' | 'image';

    allowPreviewFitToView?: boolean;
    allowButtonCancel?: boolean;
    allowButtonConfirm?: boolean;
    allowDropFiles?: boolean;
    allowBrowseFiles?: boolean;
    allowAutoClose?: boolean;
    allowAutoDestroy?: boolean;

    size?: Size;
    sizeMin?: Size;
    sizeMax?: Size;

    outputData?: boolean;
    outputFile?: boolean;
    outputWidth?: number;
    outputHeight?: number;
    outputFit?: ResizeMode;
    outputUpscale?: boolean;
    outputStripImageHead?: boolean;
    outputType?: string;
    outputQuality?: number;
    outputCanvasMemoryLimit?: number;
    outputCanvasBackgroundColor?: string;
    outputCorrectImageExifOrientation?: boolean;
    

    crop?: Crop;
    cropShowSize?: boolean;
    cropZoomTimeout?: number;
    cropAllowModifyOutputSize?: boolean;
    cropAllowImageTurnLeft?: boolean;
    cropAllowImageTurnRight?: boolean;
    cropAllowImageFlipHorizontal?: boolean;
    cropAllowImageFlipVertical?: boolean;
    cropAllowRotate?: boolean;
    cropAllowToggleLimit?: boolean;
    cropAllowInstructionZoom?: boolean;
    cropLimitToImageBounds?: boolean;
    cropResizeMatchImageAspectRatio?: boolean;
    cropResizeKeyCodes?: number[];
    cropResizeScrollRectOnly?: boolean;
    cropAspectRatio?: number|string;
    cropAspectRatioOptions?: AspectRatioOption[];
    cropMinImageWidth?: number;
    cropMinImageHeight?: number;
    cropMaskInset?: number;
    cropMask?: (element: SVGElement, setInnerHTML?: SetInnerHTML) => CropMaskUpdate | void;

    filter?: string|ColorMatrix|null;
    filters?: Filters;

    colorBrightness?: number;
    colorBrightnessRange?: Range;
    colorContrast?: number;
    colorContrastRange?: Range;
    colorExposure?: number;
    colorExposureRange?: Range;
    colorSaturation?: number;
    colorSaturationRange?: Range;

    markup?: MarkupShapeOption[];
    markupUtil?: string;
    markupFilter?: (markup: MarkupShape) => boolean;
    markupAllowAddMarkup?: boolean;
    markupDrawDistance?: number;
    markupFontSize?: number;
    markupFontSizeOptions?: MarkupOption[];
    markupFontFamily?: string;
    markupFontFamilyOptions?: MarkupFontFamilyOption[];
    markupShapeStyle?: [number | null, number | null];
    markupShapeStyleOptions?: MarkupShapeStyleOption[];
    markupLineStyle?: [number | null, number | null];
    markupLineStyleOptions?: MarkupLineStyleOption[];
    markupLineDecoration?: [] | [string] | [string, string];
    markupLineDecorationOptions?: MarkupLineDecorationOption[];
    markupColor?: string;
    markupColorOptions?: MarkupColorOption[];

    labelStatusAwaitingImage?: string;
    labelStatusLoadImageError?: string | ((error: LoadImageError) => string);
    labelStatusLoadingImage?: string;
    labelStatusProcessingImage?: string;

    labelCropInstructionZoom?: string;

    labelColorBrightness?: string;
    labelColorContrast?: string;
    labelColorExposure?: string;
    labelColorSaturation?: string;

    labelMarkupTypeRectangle?: string;
    labelMarkupTypeEllipse?: string;
    labelMarkupTypeText?: string;
    labelMarkupTypeLine?: string;
    labelMarkupSelectFontSize?: string;
    labelMarkupSelectFontFamily?: string;
    labelMarkupSelectLineDecoration?: string;
    labelMarkupSelectLineStyle?: string;
    labelMarkupSelectShapeStyle?: string;
    labelMarkupRemoveShape?: string;
    labelMarkupToolSelect?: string;
    labelMarkupToolDraw?: string;
    labelMarkupToolLine?: string;
    labelMarkupToolText?: string;
    labelMarkupToolRect?: string;
    labelMarkupToolEllipse?: string;

    labelResizeWidth?: string;
    labelResizeHeight?: string;
    labelResizeApplyChanges?: string;

    labelButtonReset?: string;
    labelButtonCancel?: string;
    labelButtonConfirm?: string;

    labelButtonUtilCrop?: string;
    labelButtonUtilFilter?: string;
    labelButtonUtilColor?: string;
    labelButtonUtilResize?: string;

    labelButtonCropZoom?: string;
    labelButtonCropRotateLeft?: string;
    labelButtonCropRotateRight?: string;
    labelButtonCropRotateCenter?: string;
    labelButtonCropFlipHorizontal?: string;
    labelButtonCropFlipVertical?: string;
    labelButtonCropAspectRatio?: string;
    labelButtonCropToggleLimit?: string;
    labelButtonCropToggleLimitEnable?: string;
    labelButtonCropToggleLimitDisable?: string;

    styleFullscreenSafeArea?: FullscreenSafeAreaOptions;
    styleLayoutMode?: StyleLayoutModes;
    styleCropCorner?: StyleCornerOptions;

    pointerEventsPolyfillScope?: PointerEventsPolyfillScope;

    beforeCreateBlob?: (canvas: HTMLCanvasElement) => Promise<HTMLCanvasElement>;
    afterCreateBlob?: (blob: Blob) => Promise<Blob>;
    afterCreateOutput?: (output: DokaOutput, setLabel?: Function) => Promise<DokaOutput>;

    oninit?: () => void;
    ondestroy?: () => void;
    oncancel?: () => void;
    onclose?: () => void;
    onconfirm?: (output: DokaOutput) => void;
    onloadstart?: (source: DokaImageSource) => void;
    onload?: (image: DokaImage) => void;
    onloaderror?: (error: DokaLoadError) => void;
    onupdate?: (state: DokaUpdate) => void;
}

type DokaLoadError = {
    data: Response;
    status: string;
}

type DokaOutputRequest = {
    file?: boolean;
    data?: boolean;
};

type DokaOutput = {
    data: DokaData | null;
    file: File | null;
};

interface IDokaInstance extends IDokaOptions {
    readonly element: HTMLElement | null;
    setOptions(options: IDokaOptions): void;
    setData(data: DokaData): void;
    getData(outputRequest: DokaOutputRequest): Promise<DokaOutput>;
    save(outputRequest: DokaOutputRequest): Promise<DokaOutput>;
    open(imageSource: DokaImageSource, imageOptions?: DokaImageOptions): Promise<DokaData>;
    edit(imageSource: DokaImageSource, imageOptions?: DokaImageOptions): Promise<DokaOutput>;
    clear(): void;
    close(): void;
    destroy(): void;
    insertBefore(element: HTMLElement): void;
    insertAfter(element: HTMLElement): void;
    appendTo(element: HTMLElement): void;
    replaceElement(element: HTMLElement): void;
    restoreElement(element: HTMLElement): void;
    isAttachedTo(element: HTMLElement): boolean;
}

interface IDoka {
    OptionTypes: object;
    supported: () => boolean;
    create: (elementOrOptions?: HTMLElement|IDokaOptions, options?: IDokaOptions) => IDokaInstance;
    destroy: (element: HTMLElement) => boolean;
    parse: (context: HTMLElement) => IDokaInstance[];
    find: (context: HTMLElement) => IDokaInstance|null;
    getOptions: () => IDokaOptions;
    setOptions: (options: IDokaOptions) => IDokaOptions;
}

export const OptionTypes: object;
export const supported: () => boolean;
export const create: (elementOrOptions?: HTMLElement|IDokaOptions, options?: IDokaOptions) => IDokaInstance;
export const destroy: (element: HTMLElement) => boolean;
export const parse: (context: HTMLElement) => IDokaInstance[];
export const find: (context: HTMLElement) => IDokaInstance|null;
export const getOptions: () => IDokaOptions;
export const setOptions: (options: IDokaOptions) => IDokaOptions;
