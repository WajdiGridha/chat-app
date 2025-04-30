import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreviewName, setFilePreviewName] = useState("");
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type.startsWith("image/")) {
      setImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(selectedFile);
      setFilePreviewName(selectedFile.name);
    }
  };

  const removeFile = () => {
    setImage(null);
    setImagePreview(null);
    setFile(null);
    setFilePreviewName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image && !file) return;

    const formData = new FormData();
    formData.append("text", text.trim());
    if (image) formData.append("image", image);
    if (file) formData.append("file", file);

    try {
      await sendMessage(formData);
      setText("");
      removeFile();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Échec de l'envoi du message");
    }
  };

  return (
    <div className="p-4 w-full">
      {(filePreviewName || imagePreview) && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 rounded-md object-cover"
              />
            ) : (
              <p className="text-sm truncate max-w-[200px]">{filePreviewName}</p>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${file || image ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !file && !image}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
