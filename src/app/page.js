"use client";

import { ChangeThemeButton } from "../components/changeThemeButton";
import { Button } from "@/components/ui/button";

import { Camera } from "lucide-react";
import { Image } from "lucide-react";

import Webcam from "react-webcam";

import { useRef, useState, useCallback } from "react";

import { getAIPrediction } from "../api/getAIPrediction";

export default function Home() {
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const webcamRef = useRef(null);

  function dataURItoFile(dataURI, filename) {
    // Split the Data URI into metadata and base64 data
    const parts = dataURI.split(";base64,");
    if (parts.length !== 2) {
      throw new Error("Invalid Data URI format.");
    }
    const metadata = parts[0];
    const base64Data = parts[1];

    // Extract the MIME type
    const mimeMatch = metadata.match(/data:(.*?)(;|$)/);
    if (!mimeMatch || !mimeMatch[1]) {
      throw new Error("Could not extract MIME type from Data URI.");
    }
    const mimeType = mimeMatch[1];

    // Decode Base64 to binary string
    const binaryString = atob(base64Data);

    // Create a Uint8Array from the binary string
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob object
    const blob = new Blob([uint8Array], { type: mimeType });

    // Create a File object (optional)
    const file = new File([blob], filename, { type: mimeType });

    return file; // Or return blob if a File object is not strictly required
  }

  const openFileExplorer = () => {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg, .jpeg, .png";
    input.onchange = (_) => {
      let files = Array.from(input.files);
      console.log(files[0]);
      setFile(files[0]);
      setImageSrc(URL.createObjectURL(files[0]));
      setPrediction(null);
    };
    input.click();
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log(imageSrc);
    setImageSrc(imageSrc || null);
    setPrediction(null);
    setFile(null);
  }, [webcamRef]);

  const retake = () => {
    setImageSrc(null);
  };

  const makeServerAction = async () => {
    if (file == null) {
      if (imageSrc == null) return;
      const newFile = dataURItoFile(imageSrc);
      const resp = await getAIPrediction(newFile);
      setPrediction(JSON.stringify(resp));
      console.log(resp);
    } else {
      const resp = await getAIPrediction(file);
      setPrediction(JSON.stringify(resp));
      console.log(resp);
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <section className="flex w-full flex-1 flex-row max-h-7! justify-end p-2">
        <ChangeThemeButton />
      </section>
      <section className="flex-11 flex flex-col h-full text-center justify-around items-center m-8 p-4 max-w-5xl w-full gap-6">
        <header>
          <h1 className="text-3xl font-bold">Plant Illness Detection AI</h1>
        </header>
        <main className="border-4 border-black rounded-3xl overflow-hidden">
          {imageSrc ? <img src={imageSrc} /> : <Webcam ref={webcamRef} />}
        </main>
        <footer className="flex flex-col gap-8 w-full">
          <section className="flex justify-around w-full">
            {imageSrc ? (
              <Button variant="outline" onClick={retake}>
                <Camera /> Retake Photo
              </Button>
            ) : (
              <Button variant="outline" onClick={capture}>
                <Camera /> Take Photo
              </Button>
            )}

            <Button variant="outline" onClick={openFileExplorer}>
              <Image /> Import Image
            </Button>
          </section>
          <section>
            {prediction == null ? (
              <Button onClick={makeServerAction}>Predict</Button>
            ) : (
              <div>
                <h1
                  className={`text-xl font-bold mb-4 ${
                    JSON.parse(prediction).health == "healthy"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  Prediction :{" "}
                  {JSON.parse(prediction).health == "healthy"
                    ? "Plant is healthy!"
                    : "Plant is not healthy..."}
                </h1>
                {JSON.parse(prediction).health == "healthy" ? null : (
                  <h1 className="text-xl font-bold mb-4">
                    Disease : {JSON.parse(prediction).predicted}
                  </h1>
                )}
                <h1 className="text-xl">
                  Confidence :{" "}
                  {(JSON.parse(prediction).confidence * 100).toFixed(2)}%
                </h1>
              </div>
            )}
          </section>
        </footer>
      </section>
    </main>
  );
}
