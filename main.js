// 여기에 Teachable Machine에서 발행한 공유 링크를 넣으세요.
// 예: "https://teachablemachine.withgoogle.com/models/ABCDEFG/"
const URL = "https://teachablemachine.withgoogle.com/models/ABCDEFG/"; 

let model, maxPredictions;

// 페이지 로드 시 모델을 미리 불러옵니다.
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("모델 로드 완료");
    } catch (e) {
        console.error("모델 로드 실패. URL을 확인해주세요.", e);
    }
}

// 페이지가 열리면 바로 실행
init();

async function predictImage(input) {
    if (!model) {
        alert("모델 로딩 중입니다. 잠시만 기다려주세요.");
        return;
    }

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        // UI 업데이트
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

            // 분석 및 결과 표시
            const prediction = await model.predict(preview);
            prediction.sort((a, b) => b.probability - a.probability);
            
            spinner.style.display = 'none';
            displayResults(prediction);
            document.querySelector('.retry-btn').style.display = 'block';
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function displayResults(prediction) {
    const labelContainer = document.getElementById('label-container');
    const barColors = ['#00d2ff', '#3a7bd5', '#6a11cb', '#2575fc'];
    
    for (let i = 0; i < maxPredictions; i++) {
        const percent = (prediction[i].probability * 100).toFixed(0);
        const className = prediction[i].className;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'result-bar-wrapper';
        
        wrapper.innerHTML = `
            <div class="bar-label">
                <span>${className}</span>
                <span>${percent}%</span>
            </div>
            <div class="bar-bg">
                <div class="bar-fill" style="width: 0%; background: ${barColors[i % barColors.length]}"></div>
            </div>
        `;
        
        labelContainer.appendChild(wrapper);
        setTimeout(() => {
            wrapper.querySelector('.bar-fill').style.width = percent + '%';
        }, 100);
    }
}