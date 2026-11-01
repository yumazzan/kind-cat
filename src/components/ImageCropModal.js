import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropModal.css';

// 선택한 영역(px 기준)만큼 원본 이미지를 캔버스에 그려서 잘라낸 File을 반환
function getCroppedFile(imageSrc, cropPixels, fileName, mimeType) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(cropPixels.width);
      canvas.height = Math.round(cropPixels.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
        0, 0, cropPixels.width, cropPixels.height
      );
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('크롭 결과를 생성하지 못했습니다')); return; }
          resolve(new File([blob], fileName, { type: mimeType }));
        },
        mimeType,
        0.9
      );
    };
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다'));
    img.src = imageSrc;
  });
}

// 선택 가능한 비율 프리셋 - 대부분 세로형(4:5, 9:16)으로 자를 일이 많아서
// 크롭 화면에서 바로 바꿔가며 고를 수 있게 함. 각 업로드 지점이 넘겨주는
// 기본 aspect도 이 목록에 없으면 맨 앞에 자동으로 추가됨(아래 useMemo 참고)
const ASPECT_PRESETS = [
  { label: '4:5', value: 4 / 5 },
  { label: '9:16', value: 9 / 16 },
  { label: '1:1', value: 1 }
];

/**
 * 이미지 업로드 전 크롭 모달
 * props:
 * - file: 선택한 원본 File
 * - aspect: 가로/세로 비율 (예: 4/5, 1, 9/16) - 처음 열릴 때 기본 선택값으로만 쓰이고,
 *   모달 안에서 4:5 / 9:16 / 1:1 중 바로 바꿔 고를 수 있음
 * - onConfirm(croppedFile): 크롭 완료 시 잘라낸 File 전달
 * - onCancel(): 취소 시
 */
function ImageCropModal({ file, aspect, onConfirm, onCancel }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState(aspect ?? ASPECT_PRESETS[0].value);
  const [naturalAspect, setNaturalAspect] = useState(null);

  // objectURL 생성과 해제를 같은 effect 안에서 짝지어야 함 - React 18
  // StrictMode에서는 effect가 mount→cleanup→mount로 두 번 실행되는데,
  // 생성(useMemo)과 해제(별도 effect)를 분리해두면 첫 mount의 cleanup이
  // useMemo가 만든 단 하나의 URL을 지워버려서 재생성 없이 그대로 죽어버림
  // (크롭 화면이 계속 검은 화면으로 뜨는 원인이었음)
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 원본 이미지 자체의 가로/세로 비율을 읽어서 "원본 비율" 프리셋으로 추가 -
  // 이미지 크기를 알아야 하므로 별도 Image 객체로 비동기 로드 후 계산
  useEffect(() => {
    setNaturalAspect(null);
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setNaturalAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const presets = useMemo(() => {
    if (!naturalAspect) return ASPECT_PRESETS;
    return [...ASPECT_PRESETS, { label: '원본 비율', value: naturalAspect }];
  }, [naturalAspect]);

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const mimeType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
      const croppedFile = await getCroppedFile(imageSrc, croppedAreaPixels, file.name, mimeType);
      onConfirm(croppedFile);
    } catch (err) {
      alert('크롭 처리 중 오류가 발생했습니다: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="crop-modal-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>🖼️ 이미지 자르기</h3>
          <p>원하는 부분을 드래그로 맞추고, 슬라이더로 확대/축소해주세요</p>
        </div>

        <div className="crop-modal-stage">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={selectedAspect}
              cropShape="rect"
              showGrid={true}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="crop-modal-controls">
          <div className="crop-aspect-presets">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`crop-aspect-btn ${selectedAspect === preset.value ? 'active' : ''}`}
                onClick={() => {
                  setSelectedAspect(preset.value);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <label className="crop-zoom-label">
            🔍
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="crop-zoom-slider"
            />
          </label>
        </div>

        <div className="crop-modal-actions">
          <button type="button" className="crop-btn-cancel" onClick={onCancel} disabled={isProcessing}>
            취소
          </button>
          <button type="button" className="crop-btn-confirm" onClick={handleConfirm} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? '처리 중...' : '✅ 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
