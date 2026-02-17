import { useState } from "react";
import imageCompression from 'browser-image-compression'
import { Log, LogLevel } from '../../log'

type ImageData = {
  name: string,
  data: string,
}
export default function useFileReader() {
  const [imageData, setImageData] = useState<ImageData | undefined>(undefined)

  const updateImage = async (img: File) => {
    const allowedExtensions = [".png",".jpg",".jpeg",".gif"]
    if (!allowedExtensions.some(extention => img.name.endsWith(extention))) {
      return
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
    }

    const compressedFile = await imageCompression(img, options);
    Log(LogLevel.Always, `Transcribing ${compressedFile.size / 1024 / 1024}MB file`);
    const reader = new FileReader()
    reader.onloadend = () => {
      const image_string = reader!.result!.toString()
      setImageData({
        name: img.name,
        data: image_string,
      })
    }
    reader.readAsDataURL(compressedFile)
  }

  return {
    updateImage,
    imageData,
  }
}
