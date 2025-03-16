import styled from "styled-components";
import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, CameraOff, Circle, XCircle } from "lucide-react";
import Button from "./Button";

// Styled Components
const CameraContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: center;
  max-width: 100%;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ErrorContainer = styled.div`
  color: #dc2626;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VideoContainer = styled.div`
  position: relative;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    aspect-ratio: 4 / 3;
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderText = styled.p`
  color: #6b7280;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      setIsCameraActive(true);
    } catch (err) {
      console.error("❌ Camera access error:", err);
      setError("Camera access denied. Please allow camera permission.");
    }
  };

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  // Capture Image
  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 224, 224);

    const imageDataUrl = canvas.toDataURL("image/jpeg");
    onCapture(imageDataUrl);
    stopCamera();
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <CameraContainer>
      <Title>Use Camera</Title>

      {error ? (
        <ErrorContainer>
          <XCircle className="w-10 h-10 mb-2" />
          <p>{error}</p>
        </ErrorContainer>
      ) : (
        <VideoContainer>
          {isCameraActive ? (
            <Video ref={videoRef} autoPlay playsInline />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PlaceholderText>Camera preview will appear here</PlaceholderText>
            </div>
          )}
        </VideoContainer>
      )}

      <ButtonContainer>
        {!isCameraActive ? (
          <Button onClick={startCamera} bgColor="#2563eb" hoverBgColor="#1d4ed8">
            <Camera className="w-5 h-5 mr-2" /> Start Camera
          </Button>
        ) : (
          <>
            <Button onClick={captureImage} bgColor="#16a34a" hoverBgColor="#15803d">
              <Circle className="w-5 h-5 mr-2" /> Capture
            </Button>
            <Button onClick={stopCamera} bgColor="#4b5563" hoverBgColor="#374151">
              <CameraOff className="w-5 h-5 mr-2" /> Stop Camera
            </Button>
          </>
        )}
      </ButtonContainer>
    </CameraContainer>
  );
};

export default CameraCapture;
