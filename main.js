// Teachable Machine에서 제공한 기본 경로
const URL = "./my_model/";

let model, labelContainer, maxPredictions;

// 파일을 읽어서 이미지 태그에 넣고 예측을 시작하는 함수
async function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = async function(e) {
            const img = document.getElementById('face-image');
            img.src = e.target.result;
            img.style.display = 'block';
            
            // 이미지 로딩이 완료되면 예측 실행
            img.onload = async function() {
                await init(); // 모델 로드
                await predict(); // 결과 예측
            };
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// 모델 로드 및 초기화
async function init() {
    // 이미 모델이 로드되어 있다면 다시 로드하지 않음
    if (model) return;

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = ""; // 기존 결과 초기화
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
    } catch (e) {
        console.error("모델 로드 실패:", e);
        alert("모델을 찾을 수 없습니다. my_model 폴더에 파일을 업로드했는지 확인해주세요.");
    }
}

// 이미지 판별
async function predict() {
    const img = document.getElementById('face-image');
    // 웹캠(webcam.canvas) 대신 이미지 태그(img)를 넣습니다.
    const prediction = await model.predict(img);
    
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability.toFixed(2) * 100).toFixed(0) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}