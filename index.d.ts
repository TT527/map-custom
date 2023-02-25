interface viewportSize {
    width: string | number
    height: string | number
}
interface Option {
    echarts: Object,
    viewportSize: viewportSize,
    fullGeoJson: Object,
    regionGeoJson?: Object,
    textureURI?: string,
    mapStyle?: mapStyle,
    lightBorderStyle?: lineStyle,
    bottomMapStyle?: lineStyle,
    layerMapStyle?: lineStyle,
}

interface mapStyle {
    areaColor: any,
    color: any,
    borderColor: any,
    borderWidth: number,
    borderType: string | number | Array<number>,
    borderDashOffset: number,
    borderCap: string,
    borderJoin: string,
    borderMiterLimit: number,
    shadowBlur: number,
    shadowColor: any,
    shadowOffsetX: number,
    shadowOffsetY: number,
    opacity: number
}

interface lineStyle {
    fill: any,
    stroke: string,
    lineWidth: number,
    shadowBlur: number,
    shadowOffsetX: number,
    shadowOffsetY: number,
    shadowColor: any,
    opacity: number,
}

interface Result {
    mapSvg: string | HTMLElement,
    geoUtils: Object,
    renderTextShapes: Function
}


export function createCustomMap(opt: Option): Result
