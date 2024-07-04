
export const binarize = (imageData : ImageData, threshold: number) : ImageData => {
    for(let y = 0; y < imageData.height; y++){
        for(let x = 0; x < imageData.width; x++) {
            const i = y * imageData.width + x
            // Red + Green + Blue
            const gray = imageData.data[i * 4 + 0] * 0.299 + imageData.data[i * 4 + 1] * 0.587 + imageData.data[i * 4 + 2] * 0.114;
            const value = gray > threshold ? 255 : 0;

            imageData.data[i * 4 + 0] = value; // 赤
            imageData.data[i * 4 + 1] = value; // 緑
            imageData.data[i * 4 + 2] = value; // 青
            imageData.data[i * 4 + 3] = 255; // アルファ
        }
    }

    return imageData;
}

export const calcOtsuThreshold = (imageData : ImageData) : number => {
    const variance = (data: number[]) : number => {
        const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        const sumOfSquaredDifferences = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0);
        const variance = sumOfSquaredDifferences / data.length;
        return variance;
    };

    const convertGrayScale = (image : ImageData) : number[] => {
        const result = new Array<number>(image.height * image.width);

        let i = 0;
        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const pixelIndex = (y * image.width + x) * 4 // RGBA format
                const r = image.data[pixelIndex]
                const g = image.data[pixelIndex + 1]
                const b = image.data[pixelIndex + 2]
                    result[i] = r * 0.299 + g * 0.587 + b * 0.114
                i++;
            }
        }

        return result;
    };

    const pixels_whole = imageData.width * imageData.height;
    const im = convertGrayScale(imageData);

    const otsuThresholds = new Array(256).fill(0);

    for (let threshold = 0; threshold < 256; threshold++) {
        const thresholded_im : number[] = im.map((v) => v > threshold ? 1 : 0)
        const weight1 = thresholded_im.reduce((sum, value) => sum + value, 0) / pixels_whole;
        const weight0 = 1 - weight1;

        if (weight1 === 0.0 || weight0 === 0.0) {
            otsuThresholds[threshold] = Infinity
            continue;
        }

        const val_pixels1 = im.filter((_, index) => thresholded_im[index] === 1);
        const val_pixels0 = im.filter((_, index) => thresholded_im[index] === 0);

        const var1 = val_pixels1.length > 0 ? variance(val_pixels1) : 0;
        const var0 = val_pixels0.length > 0 ? variance(val_pixels0) : 0;

        const criteria = weight0 * var0 + weight1 * var1;
        otsuThresholds[threshold] = criteria;
    }

    return otsuThresholds.indexOf(Math.min(...otsuThresholds))
}