let model, labelContainer, maxPredictions;

// 기존의 자동 로딩(init) 코드는 제거하고, 파일 선택 시 실행될 함수를 작성합니다.

async function loadModelFromFile(input) {
    if (!input.files || input.files.length === 0) return;

    // 파일 3개를 찾습니다.
    let modelFile, metadataFile, weightsFile;
    const files = input.files;

    for (let i = 0; i < files.length; i++) {
        if (files[i].name.endsWith('model.json')) {
            modelFile = files[i];
        } else if (files[i].name.endsWith('metadata.json')) {
            metadataFile = files[i];
        } else if (files[i].name.endsWith('.bin')) {
            weightsFile = files[i];
        }
    }

    if (!modelFile || !weightsFile) {
        alert("필수 파일이 누락되었습니다! model.json과 weights.bin 파일이 반드시 포함되어야 합니다.");
        return;
    }

    // 버튼 텍스트 변경
    const btn = document.getElementById('load-model-btn');
    const originalText = btn.innerText;
    btn.innerText = "모델 로딩 중...";
    btn.disabled = true;

    try {
        // 파일로부터 모델 로드
        model = await tmImage.loadFromFiles(modelFile, weightsFile, metadataFile);
        maxPredictions = model.getTotalClasses();
        
        console.log("Model loaded from files successfully");
        
        // UI 전환: 모델 업로드 숨기기 -> 이미지 업로드 보이기
        document.getElementById('step-model').style.display = 'none';
        document.getElementById('step-image').style.display = 'block';

        // 라벨 컨테이너 미리 생성 (결과 표시 영역)
        labelContainer = document.getElementById("label-container");
    } catch (e) {
        console.error("Model loading failed:", e);
        alert("모델 로딩에 실패했습니다. 파일이 손상되었거나 올바르지 않은 형식일 수 있습니다.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// 파일 선택 시 실행되는 함수 (이미지)
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
            
            if(document.getElementById('label-container')) {
                document.getElementById('label-container').innerHTML = ''; // 이전 결과 초기화
            }

            // 이미지가 로드된 후 예측 실행
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
        alert("모델이 로드되지 않았습니다.");
        return;
    }

    const image = document.getElementById('image-preview');
    const prediction = await model.predict(image, false);
    
    // 로딩 숨기기
    document.getElementById('loading-area').style.display = 'none';

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // 기존 결과 삭제

    const barColors = ['#FF0D72', '#0DC2FF', '#0DFF72', '#FFE138'];

    // 예측 결과 정렬
    prediction.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability));

    for (let i = 0; i < maxPredictions; i++) {
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