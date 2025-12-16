import ColorThief from 'colorthief';

interface ExtractedColors {
    vibrant: string;
    light: string;
    dark: string;
}

interface ColorInfo {
    rgb: number[];
    brightness: number;
    saturation: number;
    hue: number;
    isGrayscale: boolean;
}

// Функция для вычисления разницы между оттенками (учитывает цикличность 0-360°)
const getHueDifference = (hue1: number, hue2: number): number => {
    const diff = Math.abs(hue1 - hue2);
    return Math.min(diff, 360 - diff);
};

// Проверка, являются ли цвета слишком похожими
const areColorsSimilar = (color1: ColorInfo, color2: ColorInfo): boolean => {
    const hueDiff = getHueDifference(color1.hue, color2.hue);
    const brightnessDiff = Math.abs(color1.brightness - color2.brightness);

    // Цвета похожи если:
    // - Оттенки близки (разница < 30°) И яркость близка (< 40)
    return hueDiff < 30 && brightnessDiff < 40;
};

export const extractColorsFromImage = (imageUrl: string): Promise<ExtractedColors> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                const colorThief = new ColorThief();
                const palette = colorThief.getPalette(img, 12); // Еще больше цветов

                if (!palette || palette.length === 0) {
                    reject(new Error('Failed to extract colors'));
                    return;
                }

                // Анализируем каждый цвет
                const analyzedColors: ColorInfo[] = palette.map((rgb: number[]) => {
                    const [r, g, b] = rgb;

                    // Яркость (0-255)
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

                    // Насыщенность (0-255)
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const saturation = max - min;

                    // Оттенок (hue) 0-360°
                    let hue = 0;
                    if (saturation !== 0) {
                        const delta = max - min;
                        if (max === r) {
                            hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
                        } else if (max === g) {
                            hue = ((b - r) / delta + 2) * 60;
                        } else {
                            hue = ((r - g) / delta + 4) * 60;
                        }
                    }

                    // Проверка на серый цвет
                    const isGrayscale = saturation < 25;

                    return {
                        rgb,
                        brightness,
                        saturation,
                        hue,
                        isGrayscale
                    };
                });

                // Фильтруем цветные (не серые)
                const colorfulColors = analyzedColors.filter(c => !c.isGrayscale && c.saturation > 30);

                // LIGHT - сначала выбираем светлый цвет
                const lightCandidates = colorfulColors
                    .filter(c =>
                        c.brightness > 150 && // Светлый
                        c.saturation > 10 &&  // Не белый
                        c.saturation < 80     // Не перенасыщенный
                    )
                    .sort((a, b) => b.brightness - a.brightness);

                const lightColor = lightCandidates.length > 0
                    ? lightCandidates[0]
                    : analyzedColors
                        .filter(c => !c.isGrayscale)
                        .sort((a, b) => b.brightness - a.brightness)[0];

                // VIBRANT - выбираем ОТЛИЧНЫЙ от light по оттенку
                let vibrantCandidates = colorfulColors
                    .filter(c =>
                        c.brightness > 40 &&   // Не слишком темный
                        c.brightness < 200 &&  // Не слишком светлый
                        c.saturation > 40      // Достаточно насыщенный
                    )
                    .sort((a, b) => b.saturation - a.saturation);

                // Фильтруем кандидатов, которые отличаются от light
                const distinctVibrantCandidates = vibrantCandidates.filter(
                    c => !areColorsSimilar(c, lightColor)
                );

                const vibrantColor = distinctVibrantCandidates.length > 0
                    ? distinctVibrantCandidates[0]  // Берем самый насыщенный из непохожих
                    : vibrantCandidates.length > 0
                        ? vibrantCandidates[0]         // Fallback на любой насыщенный
                        : colorfulColors.sort((a, b) => b.saturation - a.saturation)[0];

                // DARK - темный насыщенный цвет, отличный от обоих
                const darkCandidates = colorfulColors
                    .filter(c =>
                        c.brightness < 100 &&
                        c.saturation > 30 &&
                        !areColorsSimilar(c, lightColor) &&
                        !areColorsSimilar(c, vibrantColor)
                    )
                    .sort((a, b) => a.brightness - b.brightness);

                const darkColor = darkCandidates.length > 0
                    ? darkCandidates[0]
                    : analyzedColors
                        .filter(c => !c.isGrayscale)
                        .sort((a, b) => a.brightness - b.brightness)[0];

                // Финальные цвета
                const finalVibrant = vibrantColor || analyzedColors[0];
                const finalLight = lightColor || analyzedColors[0];
                const finalDark = darkColor || analyzedColors[analyzedColors.length - 1];

                console.log('🎨 Extracted colors:', {
                    vibrant: {
                        rgb: `rgb(${finalVibrant.rgb.join(',')})`,
                        hue: Math.round(finalVibrant.hue),
                        saturation: Math.round(finalVibrant.saturation),
                        brightness: Math.round(finalVibrant.brightness)
                    },
                    light: {
                        rgb: `rgb(${finalLight.rgb.join(',')})`,
                        hue: Math.round(finalLight.hue),
                        saturation: Math.round(finalLight.saturation),
                        brightness: Math.round(finalLight.brightness)
                    },
                    dark: {
                        rgb: `rgb(${finalDark.rgb.join(',')})`,
                        hue: Math.round(finalDark.hue),
                        saturation: Math.round(finalDark.saturation),
                        brightness: Math.round(finalDark.brightness)
                    },
                    hueDifference: Math.round(getHueDifference(finalVibrant.hue, finalLight.hue))
                });

                resolve({
                    vibrant: rgbToHex(finalVibrant.rgb),
                    light: rgbToHex(finalLight.rgb),
                    dark: rgbToHex(finalDark.rgb),
                });
            } catch (err) {
                console.error('Color extraction error:', err);
                reject(err);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
    });
};

const rgbToHex = (rgb: number[]): string => {
    const [r, g, b] = rgb;
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

export const updateCSSVariables = (colors: ExtractedColors) => {
    console.log('🎨 Updating CSS variables:', colors);
    document.documentElement.style.setProperty('--accent-color', colors.vibrant);
    document.documentElement.style.setProperty('--accent-color-light', colors.light);
    document.documentElement.style.setProperty('--accent-color-dark', colors.dark);
};
