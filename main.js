// Teachable Machine 모델 URL
// 사용자가 직접 만든 모델 파일을 my_model 폴더에 넣어야 합니다.
const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// 시작 버튼 클릭 시 실행
async function init() {
    const startBtn = document.getElementById('start-btn');
    startBtn.innerText = "로딩 중...";
    startBtn.disabled = true;

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    } catch (e) {
        alert("모델 파일을 찾을 수 없습니다! 'my_model' 폴더에 model.json과 metadata.json이 있는지 확인해주세요.");
        startBtn.innerText = "테스트 시작하기";
        startBtn.disabled = false;
        return;
    }

    // 웹캠 설정
    const flip = true; 
    webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
    await webcam.setup(); // 웹캠 접근 권한 요청
    await webcam.play();
    window.requestAnimationFrame(loop);

    // UI 업데이트
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    document.getElementById("upload-area").style.display = "none"; // 시작 버튼 숨기기
    
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        // 결과 바(Bar) 생성
        const wrapper = document.createElement("div");
        wrapper.className = "label-wrapper";
        
        // 동물 이름 (예: Dog, Duck)
        const nameDiv = document.createElement("div");
        nameDiv.className = "label-name";
        wrapper.appendChild(nameDiv);

        // 게이지 바 배경
        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";
        
        // 게이지 바 채움
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressContainer.appendChild(progressBar);
        wrapper.appendChild(progressContainer);

        // 퍼센트 텍스트
        const percentDiv = document.createElement("div");
        percentDiv.className = "label-percent";
        wrapper.appendChild(percentDiv);

        labelContainer.appendChild(wrapper);
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

// 예측 및 결과 표시
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    // 색상 배열 (순서대로 적용)
    const barColors = ['#FF0D72', '#0DC2FF', '#0DFF72', '#FFE138'];

    for (let i = 0; i < maxPredictions; i++) {
        const wrapper = labelContainer.childNodes[i];
        const nameDiv = wrapper.getElementsByClassName("label-name")[0];
        const progressBar = wrapper.getElementsByClassName("progress-bar")[0];
        const percentDiv = wrapper.getElementsByClassName("label-percent")[0];

        // 클래스 이름 (Dog -> 강아지, Duck -> 오리 등으로 변경 가능)
        // 여기서는 모델의 클래스명을 그대로 사용합니다.
        nameDiv.innerHTML = prediction[i].className;
        
        // 확률 계산
        const probability = prediction[i].probability.toFixed(2);
        const percent = Math.round(probability * 100);

        // 스타일 적용
        progressBar.style.width = percent + "%";
        progressBar.style.backgroundColor = barColors[i % barColors.length];
        
        percentDiv.innerHTML = percent + "%";
    }
}