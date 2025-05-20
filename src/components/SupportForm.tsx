import { useState } from 'react';
import ImageCard from './ImageCard';

const QB_TOKEN = import.meta.env.VITE_QB_TOKEN;
console.log('QB_TOKEN:', QB_TOKEN);


export default function SupportForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Quickbase');
  const [type, setType] = useState('Fix');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  //Image Card Rendering
  const handleFileAdd = (file: File) => {
    setImages((prev) => [...prev, file]);
  };

  const renderImageCards = () => {
    return (
      <div className="flex space-x-2 flex-wrap">
        {images.map((file, index) => (
          <ImageCard
            key={index}
            previewUrl={URL.createObjectURL(file)}
            onFileChange={() => {}} // no-op for existing cards
          />
        ))}
        <ImageCard onFileChange={handleFileAdd} />
      </div>
    );
  };

  //Submit logic
  const uploadImageToChild = async (file: File, parentRecId: string) => {
    console.log("parentRecId prop:", parentRecId);
    const fileToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    const fileBase64 = (await fileToBase64(file)).split(',')[1];

    const imagePayload = JSON.stringify({
      to: "bu5xnvaq4",
      data: [
        {
          "7": { value: Number(parentRecId) },
          "6": {
            value: {
              fileName: file.name,
              data: fileBase64
            }
          }
        }
      ],
      fieldsToReturn: [3, 7, 6]
    });
    console.log("Image payload:", imagePayload);

    const res = await fetch("https://api.quickbase.com/v1/records", {
      method: "POST",
      headers: {
        "QB-Realm-Hostname": "superafulfillm.quickbase.com",
        "User-Agent": "SupportForm",
        Authorization: `QB-USER-TOKEN ${QB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: imagePayload
    });
  
    const responseData = await res.json();
    console.log("Image creation response:", responseData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = JSON.stringify({
      to: 'bu5w3xbys',
      data: [
        {
          "8": { value: name },
          "9": { value: email },
          "10": { value: category },
          "11": { value: type },
          "12": { value: description },
          "13": { value: urgent }
        }
      ],
      fieldsToReturn: [3]
    });

    const response = await fetch('https://api.quickbase.com/v1/records', {
      method: 'POST',
      headers: {
        "QB-Realm-Hostname": "superafulfillm.quickbase.com",
        "User-Agent": "SupportForm",
        Authorization: `QB-USER-TOKEN ${QB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: payload
    });

    if (!response.ok) {
      console.error('Failed to create ticket:', response.statusText);
      return;
    }

    const responseData = await response.json();
    const parentRecId = responseData.data[0]["3"].value;
    console.log("Parent Rec:", parentRecId);

    await new Promise((resolve) => setTimeout(resolve, 300)); // delay 300ms
    if (images.length > 0) {
      for (const file of images) {
        await uploadImageToChild(file, parentRecId);
      }
    };

    setEmail('');
    setCategory('Quickbase');
    setType('Fix');
    setDescription('');
    setImages([]);
    setUrgent(false);
    setSubmitted(true);

  };

  //TSX
  return (
    <>
      {submitted ? (
        <div className="text-center space-y-4 bg-white border-4 border-blue-500 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-green-600">🎉 Ticket Submitted</h2>
          <p>Thank you {name}! I'll get back to you as soon as possible.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setName('');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Another Ticket
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="text-left max-w-2xl w-full mt-10 bg-white p-6 rounded-2xl shadow-lg space-y-4"
        >
          <h2 className="text-2xl font-bold text-center">Submit a Support Ticket</h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Submitter Name
            </label>
            <input
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jeremy Clarkson"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Quickbase</option>
              <option>PC</option>
              <option>Email</option>
              <option>Other</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="category">
              Request Type
            </label>
            <select
              id="type"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Fix</option>
              <option>Request Feature / Suggestion</option>
              <option>Request for information</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Please be as detailed as possible, and provide a link to the issue if applicable."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="images">
              Attach screenshots or files (optional)
            </label>
            {renderImageCards()}
          </div>

          {/* Urgent Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="urgent"
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="urgent" className="text-sm">
              Mark as Urgent
            </label>
          </div>
          {urgent === true && (
            <>
              <span className="text-red-500">
                *This issue has halted one or more workflows and thus will be sent to the top of the priority list*
              </span>
              <span> Please don't abuse me 🙂</span>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Ticket
          </button>
        </form>
      )}
      </>
  );
}
