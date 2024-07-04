
const imageToHexString = (bitmap: number[][], delimiter: string) : string =>
{
    const w = bitmap[0].length
    const h = bitmap.length
    let result = '';

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            result += "0x" + bitmap[y][x].toString(16).padStart(2, '0') + delimiter;
        }
    }

    return result.length > 0 ? result.slice(0, -1) : '';
}


const encodeVertical = (binaryImage: ImageData, delimiter: string, invert: boolean) : string => {
    
    const byteToBitVertical = (bitmap: ImageData) : number[][] => {
        const w = bitmap.width;
        const h = Math.floor(bitmap.height / 8);

        const result = new Array<Array<number>>(h + ((bitmap.height % 8 > 0) ? 1 : 0)).fill([0]).map(
            () => new Array<number>(bitmap.width).fill(0));
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const start = y * 8;
                const lest = bitmap.height - start;
                const max = lest < 8 ? lest : 8;
    
                for (let i = 0; i < max; i++) {
                    const pixelIndex = ((start + i) * bitmap.width + x) * 4; // RGBA format
                    const bitFlag : number = bitmap.data[pixelIndex] === 255 ? 1 : 0;
                    const bit = invert? (7 - (i % 8)) : (i % 8)
                    result[y][x] |= (bitFlag << bit);
                }
            }
        }
    
        return result;
    }
    
    return imageToHexString(byteToBitVertical(binaryImage), delimiter);
  }

  const encodeHorizontal = (binaryImage: ImageData, delimiter: string, invert: boolean) : string => {
    
    const byteToBitHorizontal = (bitmap: ImageData) : number[][] => {
        const w = Math.floor(bitmap.width / 8);
        const h = bitmap.height;

        const result = new Array<Array<number>>(bitmap.height).fill([0]).map(
            () => new Array<number>(w + ((bitmap.width % 8 > 0) ? 1 : 0)).fill(0));

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const start = x * 8;
                const lest = bitmap.width - start;
                const max = lest < 8 ? lest : 8;
                
                for (let i = 0; i < max; i++) {
                    const pixelIndex = (y * bitmap.width + (start + i)) * 4 // RGBA format
                    const bitFlag = bitmap.data[pixelIndex] === 255 ? 1 : 0;
                    const bit = invert? (7 - (i % 8)) : (i % 8)
                    result[y][x] |= (bitFlag << bit);
                }
            }
        }

        return result;
    }

    return imageToHexString(byteToBitHorizontal(binaryImage), delimiter);
}

export type Direction = "Vertical"|"Horizontal"

export interface encodeProps {
    direction: Direction,
    binaryImage: ImageData, 
    delimiter: string,
    invert: boolean
}

export default function encode(props: encodeProps) : string {
    if(props.direction === "Vertical"){
        return encodeVertical(props.binaryImage, props.delimiter, props.invert)
    }

    return encodeHorizontal(props.binaryImage, props.delimiter, props.invert)
}