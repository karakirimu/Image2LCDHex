import { Spacer, Card, Radio, Input, Textarea, Switch, CardBody, CardHeader, RadioGroup, Button, Slider } from "@nextui-org/react"
import { useRef, useEffect, useContext, useState } from "react"
import { AppContext, Operation, PanelOperation } from "./AppContextProvider"
import { MdClose } from "react-icons/md"
import { binarize, calcOtsuThreshold } from "./binarize"
import encode, { encodeProps } from "./encode"

export interface PanelProps {
    hex: string,
    direction: string,
    width: number,
    height: number,
    delimiter: string,
    invert: boolean,
    otsuMethod: boolean,
    id: string
}

export default function Panel(props: PanelProps) {
  const canvasId= "image2lcdhex-" + crypto.randomUUID()
  const [imageId, setImageId] = useState<string>(crypto.randomUUID())
  const directionRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const heightRef = useRef<HTMLInputElement>(null)
  const widthRef = useRef<HTMLInputElement>(null)
  const delimiterRef = useRef<HTMLInputElement>(null)
  const c = useContext(AppContext)
  const [sliderValue, setSliderValue] = useState<number>(100);  
  const [inputFile, setInputFile] = useState<Blob>();  

  const enc = (image : ImageData) : string => {
    const d : encodeProps = {
      direction: (props.direction === "Vertical")? "Vertical":"Horizontal",
      binaryImage: image,
      delimiter: props.delimiter,
      invert: props.invert
    }
    return encode(d)
  }

  useEffect(() => {
    console.log(`useEffect ${imageId}`)
    
    if(typeof heightRef.current?.value !== "undefined"){
      heightRef.current!.value = props.height.toString()
    }
    
    if(typeof widthRef.current?.value !== "undefined"){
      widthRef.current!.value = props.width.toString()
    }
    
    if(typeof delimiterRef.current?.value !== "undefined"){
      delimiterRef.current!.value = props.delimiter
    }
    
    if(typeof directionRef.current?.value !== "undefined"){
      directionRef.current!.value = props.direction
    }
    
    const ctx = (canvasRef.current as unknown as HTMLCanvasElement).getContext('2d')
    const imgSrc = (imageRef.current as unknown as HTMLCanvasElement).getContext('2d', { willReadFrequently : true })
    
    if(ctx === null || ctx === undefined || imgSrc === null || imgSrc === undefined){
      return
    }

    if(props.height == 0 || props.width == 0){
      return
    }

    ctx.imageSmoothingEnabled = false
    ctx.imageSmoothingQuality = "high"
    const image = imgSrc.getImageData(0, 0, props.width, props.height)
    
    const v = props.otsuMethod === true ? calcOtsuThreshold(image) : sliderValue
    const result = binarize(image, v)
    ctx.putImageData(result, 0, 0)
    handleEdit(PanelOperation.Hex, enc(result))

  },[imageId, props.delimiter, props.direction, props.invert, props.otsuMethod, sliderValue])
  
  useEffect(() => {
    if(inputFile){
      loadImage(inputFile)
    }
  }, [props.height, props.width])

  const handleEdit = (o: PanelOperation, v: string|boolean) => {
    console.log(`Operation: ${o}, Value: ${v}`)
    c.context.set({
      operation: Operation.Edit,
      panel: { id: props.id, operation: o, value: v }
    })
  }

  const loadImage = (image: Blob) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      
      if(e.target === null || e.target === undefined){
        console.error("No image file selected.")
        return;
      }
      
      const img = new Image();
      img.src = e.target.result as string;
      
      img.onload = () => {
        if(imageRef.current){
            const ctx = (imageRef.current as unknown as HTMLCanvasElement).getContext('2d')
            if(ctx){
              (imageRef.current as unknown as HTMLCanvasElement).innerHTML = '';
              (imageRef.current as unknown as HTMLCanvasElement).appendChild(img);
              ctx.drawImage(img, 0, 0, props.width, props.height);
              setImageId(crypto.randomUUID())
            }
          }
        };
    };

    reader.readAsDataURL(image)
  }

  const previewImage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setImageId(crypto.randomUUID() as string)
      const files = event.currentTarget.files;
      if (!files || files.length === 0) return;

      loadImage(files[0])
      setInputFile(files[0])
  }

  const manualThreshold = (view: boolean) => {
    if(view === true){
      return (
      <>
        <Spacer y={2}/>
        <Slider
          label={"Threshold"}
          id={"threshold-" + imageId}
          minValue={0}
          maxValue={255}
          value={sliderValue}
          onChange={(value) => {
            setSliderValue(value as number);
          }}
        />
        <Spacer y={2}/>
      </>
      )
    }
    return (<Spacer y={2}/>)
  }

  return (<>
    <Card>
        <div className="flex flex-row gap-1">
          <div className="flex flex-col gap-1">
              <CardBody>
                <Spacer y={1}/>
                <p className="text-neutral-400 text-inherit">Size</p>
                <Spacer y={2}/>
                <div className="flex flex-row gap-2">
                  <Input
                    area-label="hex-width"
                    ref={widthRef}
                    label="width"
                    min={1}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">px</span>
                      </div>
                    }
                    defaultValue={props.width.toString()}
                    type="number"
                    onChange={(v) => {handleEdit(PanelOperation.Width, v.currentTarget.value)}}
                  />
                  <Input
                    area-label="hex-height"
                    ref={heightRef}
                    label="height"
                    min={1}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">px</span>
                      </div>
                    }
                    defaultValue={props.height.toString()}
                    type="number"
                    onChange={(v) => {handleEdit(PanelOperation.Height, v.currentTarget.value)}}
                  />
                </div>
                <Spacer y={4}/>
                <p className="text-neutral-400 text-inherit">Input</p>
                <Spacer y={2}/>
                <input type="file" accept="image/*" onChange={previewImage} />
                <Spacer y={2}/>
                <canvas className="border-2" ref={imageRef} width={props.width} height={props.height} id={imageId} />
                <Spacer y={4}/>
                <p className="text-neutral-400 text-inherit">Binary</p>
                <Spacer y={2}/>
                <Switch id="otsu-method" isSelected={props.otsuMethod} onValueChange={(v: boolean) => {
                  handleEdit(PanelOperation.OtsuMethod, v)}}>
                  Otsu method
                </Switch>
                {manualThreshold(!props.otsuMethod)}
                <canvas className="border-2" ref={canvasRef} width={props.width} height={props.height} id={canvasId} />
              </CardBody>
          </div>
          <div className="flex w-full flex-col gap-1 justify-center text-center">
            <CardHeader className="px-5 pb-1 justify-between">
              <p className="text-neutral-400 text-inherit">Result</p>
              <Button
                isIconOnly
                radius="full"
                onClick={() => c.context.set({operation: Operation.Remove, panel: {id: props.id}})}>
                <MdClose />
              </Button>
            </CardHeader>
            <CardBody className="pt-1">
                <div className="flex flex-row gap-12">
                  <RadioGroup 
                    ref={directionRef}
                    label="Direction"
                    orientation="vertical"
                    defaultValue="Vertical"
                    onValueChange={(v: string) => {handleEdit(PanelOperation.Direction, v)}}>
                    <Radio value="Vertical" color="primary">Vertical</Radio>
                    <Radio value="Horizontal" color="secondary">Horizontal</Radio>
                  </RadioGroup>
                  <Switch id="invert" isSelected={props.invert} onValueChange={(v: boolean) => {
                    handleEdit(PanelOperation.Invert, v)}}>
                    Invert
                  </Switch>
                </div>
                <Spacer y={4}/>
                <Input isClearable
                  ref={delimiterRef}
                  label="Delimiter"
                  placeholder="Regex"
                  defaultValue={props.delimiter}
                  onClear={() => {handleEdit(PanelOperation.Delimiter, '')}}
                  onInput={(v) => {handleEdit(PanelOperation.Delimiter, v.currentTarget.value)}} />
                <Spacer y={2}/>
                <Textarea
                  ref={textareaRef}
                  label="Hex array"
                  value={props.hex}
                  defaultValue={props.hex}
                  readOnly={true}
                />
            </CardBody>
          </div>
        </div>
      </Card>
  </>);
}