// Teachable Machine에서 제공한 모델 URL
const URL = "https://teachablemachine.withgoogle.com/models/alrTVy0nz/";

let model, maxPredictions;

// 페이지 로드 시 모델을 미리 로드합니다.
async function loadModel() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

// 초기화
loadModel();

async function predictImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        // UI 표시 전환
        document.getElementById('upload-label').style.display = 'none';
        const preview = document.getElementById('preview-image');
        const resultSection = document.getElementById('result-section');
        const spinner = document.getElementById('loading-spinner');
        const labelContainer = document.getElementById('label-container');
        
        resultSection.style.display = 'block';
        spinner.style.display = 'block';
        labelContainer.innerHTML = '';
        
        reader.onload = async function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';

            try {
                // 모델 로드 확인 (아직 안 된 경우를 대비)
                await loadModel();
                
                // AI 분석 실행
                const prediction = await model.predict(preview);
                
                // 확률 순으로 정렬
                prediction.sort((a, b) => b.probability - a.probability);
                
                spinner.style.display = 'none';
                displayResults(prediction);
                document.querySelector('.retry-btn').style.display = 'block';
                
            } catch (error) {
                console.error(error);
                alert("모델 분석 중 오류가 발생했습니다.");
                location.reload();
            }
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function displayResults(prediction) {
    const labelContainer = document.getElementById('label-container');
    
    // 결과에 따른 재미있는 코멘트 추가 가능
    const bestMatch = prediction[0].className;
    const resultTitle = document.createElement('h2');
    resultTitle.style.textAlign = 'center';
    resultTitle.style.marginBottom = '20px';
    resultTitle.innerText = `당신은 ${bestMatch}상입니다!`;
    labelContainer.appendChild(resultTitle);

    for (let i = 0; i < maxPredictions; i++) {
        const percent = (prediction[i].probability * 100).toFixed(0);
        const className = prediction[i].className;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'result-bar-wrapper';
        
        wrapper.innerHTML = `
            <div class="bar-label">
                <span>${className}상</span>
                <span>${percent}%</span>
            </div>
            <div class="bar-bg">
                <div class="bar-fill" style="width: 0%"></div>
            </div>
        `;
        
        labelContainer.appendChild(wrapper);
        
        // 애니메이션 효과
        setTimeout(() => {
            wrapper.querySelector('.bar-fill').style.width = percent + '%';
        }, 100);
    }
}