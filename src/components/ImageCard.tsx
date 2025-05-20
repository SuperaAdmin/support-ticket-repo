import { useRef } from 'react';

interface ImageCardProps {
  previewUrl?: string;
  onFileChange: (file: File) => void;
}

export default function ImageCard({ previewUrl, onFileChange }: ImageCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
    console.log("Clicked");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };

  return (
    <div
      onClick={handleClick}
      className="w-20 h-20 grid place-items-center border-4 border-blue-500 text-blue-500 rounded-lg cursor-pointer overflow-hidden"
      style={{ paddingLeft: '0px' }}
    >
      {!previewUrl ? (
        <span className="ml-[50px] pb-1 text-4xl font-mono leading-[0] transform translate-y-px">＋</span>
      ) : (
        <img src={previewUrl} alt="preview" className="object-cover w-full h-full" />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
