import {parseSvg, vNodeToString} from "./svgUtils.js";

export function createCustomMap(opt) {
    const {
        echarts,
        viewportSize,
        fullGeoJson,
        regionGeoJson,
        mapStyle,
        lightBorderStyle,
        bottomMapStyle,
        layerMapStyle
    } = opt
    const width = viewportSize.width
    const height = viewportSize.height
    const chart = echarts.init(
        undefined,
        null,
        {
            width,
            height,
            renderer: "svg",
            ssr: true
        }
    )
    const fullMapName = `custom_full_map_${Date.now()}`
    echarts.registerMap(fullMapName, {geoJSON: regionGeoJson || fullGeoJson})

    const defaultMapStyle = {
        areaColor: 'rgba(8,170,210,0.13)',
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.8)",
        shadowColor: "rgb(0,160,255)",
        shadowBlur: 5,
        shadowOffsetY: 2,
    }

    chart.setOption({
        geo: {
            map: fullMapName,
            label: {
                show: false
            },
            itemStyle: mapStyle || defaultMapStyle,
        },
        series: [
            {
                type: 'map',
                map: fullMapName,
                geoIndex: 0
            }
        ]
    })

    // regionPath
    let regionPathStr
    const list = Object.assign({}, chart._zr.painter.storage.getDisplayList(true))
    const listKeys = Object.keys(list)
    if (listKeys.length > 1) {
        const keyMap = {}
        Object.keys(list).forEach(key => {
            const item = list[key]
            keyMap[item.id] = item._textContent.style.text
        })
        const VNode = chart._zr.painter.renderToVNode({
            animation: false,
            willUpdate: false,
            compress: true,
            useViewBox: true
        })
        VNode.children.forEach(child => {
            if (keyMap[child.key]) {
                child.attrs.name = keyMap[child.key]
            }
        })
        regionPathStr = vNodeToString(VNode, true)
    }

    // customMap
    const provincePoints = fullGeoJson.features[0].geometry.coordinates
    const drawMap3d = () => {
        const group = {
            type: 'group',
            children: []
        }

        const customLightBorderStyle = lightBorderStyle || {
            fill: 'none',
            lineWidth: 3,
            stroke: "rgba(74,201,255,1)",
            shadowBlur: 10,
            shadowColor: "rgba(0,141,255,0.9)"
        }

        const customBottomMapStyle = bottomMapStyle || {
            fill: 'rgba(0,38,68,0.05)',
            stroke: 'rgb(92,173,239)',
        }

        const customLayerMapStyle = layerMapStyle || {
            fill: 'none',
            lineWidth: 1,
            stroke: "rgba(0,113,255,0.1)"
        }

        for (let p = 0; p < provincePoints.length; p++) {
            const allPoints = provincePoints[p][0].map(item => {
                return chart.convertToPixel('geo', item)
            })
            const lightBorder = {
                type: 'polyline',
                id: `lightBorder_${p}`,
                shape: {
                    points: allPoints
                },
                style: customLightBorderStyle
            }
            const bottomMap = {
                type: 'polygon',
                id: `bottomMap_${p}`,
                shape: {
                    points: allPoints
                },
                x: 0,
                y: 15,
                style: customBottomMapStyle
            }
            group.children.push(lightBorder, bottomMap)
            // 添加地图层级
            for (let i = 1; i < 15; i++) {
                const z_indexMap = {
                    type: 'polyline',
                    id: `layer_${p}_${i}`,
                    shape: {
                        points: allPoints
                    },
                    x: 0,
                    y: i,
                    style: customLayerMapStyle
                }
                group.children.push(z_indexMap)
            }
        }
        return group
    }
    chart.setOption({
        series: [
            {
                type: 'custom',
                id: 'customMap',
                animation: false,
                show: false,
                silent: true,
                coordinateSystem: 'geo',
                renderItem: drawMap3d,
                z: 10,
                data: [0]
            }
        ]
    })
    const svgStr = chart.renderToSVGString({useViewBox: true})
    const mapSvg = parseSvg(svgStr, width, height, regionPathStr)
    const geoUtils = chart._coordSysMgr._coordinateSystems[0]

    // textShapes
    const nameCoords = [];
    (regionGeoJson || fullGeoJson).features.forEach(feat => {
        const {name, cp, center} = feat.properties
        const coord = cp || center
        if (name && coord) {
            nameCoords.push({name, coord})
        }
    })
    const renderTextShapes = (params, api, {style, minHide}) => {
        const children = []
        const zoom = params.coordSys.zoom
        for (let i = 0; i < nameCoords.length; i++) {
            const {name, coord} = nameCoords[i]
            const point = geoUtils.dataToPoint(coord)
            const [x, y] = api.coord(point)
            let px = 12
            if (zoom >= 1) {
                px += zoom * 2
            } else {
                px -= zoom * 2
                if (zoom < minHide || 0.3) px = 0
            }
            const textShape = {
                type: 'text',
                id: `${name}_shape`,
                x: x,
                y: y,
                style: Object.assign({
                    text: name,
                    font: `bolder ${px}px "Microsoft YaHei", sans-serif`,
                    fill: '#ffffff'
                }, style || {})
            }
            children.push(textShape)
        }
        return {
            type: 'group',
            id: 'mapCityTextGroup',
            children
        }
    }

    return {
        mapSvg,
        geoUtils,
        renderTextShapes
    }
}

