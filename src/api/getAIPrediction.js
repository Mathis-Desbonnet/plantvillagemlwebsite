"use server";

export async function getAIPrediction(file) {
  if (!file) {
    alert("Please select a file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // 'file' should match the parameter name in your FastAPI endpoint
  return await fetch("http://localhost:5000/predict_image", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .catch((err) => err.json());
}
