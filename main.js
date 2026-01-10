const URL = "./my_model/";

let model, labelContainer, maxPredictions;

// 페이지 로드 시 모델 미리 로드
document.addEventListener('DOMContentLoaded', init);

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully");
    } catch (e) {
        console.error("Model loading failed:", e);
        // 모델 로드 실패 시 사용자에게 알림은 업로드 시점에 처리하거나 여기에 표시 가능
    }
}

// 파일 선택 시 실행되는 함수
function readFile(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            // 이미지 미리보기 표시
            const imagePreview = document.getElementById('image-preview');
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            document.getElementById('upload-text').style.display = 'none'; // 안내 문구 숨김

            // 로딩 표시
            const loadingArea = document.getElementById('loading-area');
            loadingArea.style.display = 'block';
            document.getElementById('label-container').innerHTML = ''; // 이전 결과 초기화

            // 이미지가 로드된 후 예측 실행 (약간의 딜레이를 주어 UI 업데이트 보장)
            imagePreview.onload = function() {
                setTimeout(predict, 500); 
            };
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// 예측 및 결과 표시
async function predict() {
    if (!model) {
        alert("모델이 아직 로드되지 않았거나 찾을 수 없습니다.");
        document.getElementById('loading-area').style.display = 'none';
        return;
    }

    const image = document.getElementById('image-preview');
    const prediction = await model.predict(image, false);
    
    // 로딩 숨기기
    document.getElementById('loading-area').style.display = 'none';

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // 기존 결과 삭제

    // 색상 배열
    const barColors = ['#FF0D72', '#0DC2FF', '#0DFF72', '#FFE138'];

    // 예측 결과 정렬 (확률 높은 순)
    prediction.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability));

    for (let i = 0; i < maxPredictions; i++) {
        // 결과 바 생성 구조
        const wrapper = document.createElement("div");
        wrapper.className = "label-wrapper";
        
        const nameDiv = document.createElement("div");
        nameDiv.className = "label-name";
        nameDiv.innerHTML = prediction[i].className;
        wrapper.appendChild(nameDiv);

        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";
        
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        
        // 확률 계산
        const probability = prediction[i].probability.toFixed(2);
        const percent = Math.round(probability * 100);

        progressBar.style.width = percent + "%";
        progressBar.style.backgroundColor = barColors[i % barColors.length];
        
        progressContainer.appendChild(progressBar);
        wrapper.appendChild(progressContainer);

        const percentDiv = document.createElement("div");
        percentDiv.className = "label-percent";
        percentDiv.innerHTML = percent + "%";
        wrapper.appendChild(percentDiv);

        labelContainer.appendChild(wrapper);
    }
}