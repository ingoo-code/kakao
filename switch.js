console.log('switch문 이해하기');

//성별

let gender = "여자"; // 남자 or 여자 

// 남자일경우 숫자 1일출력 여자일경우 숫자2를 출력 
// 10개

if(gender == "남자"){
    console.log(1);
} else if(gender == "여자"){
    console.log(2);
}

// if문에서 == 만 활용할때 같다표현을 복수일때.
switch(gender){
    case "남자":
        console.log(1)
    break;
    case "여자":
        console.log(2)
    break;
    case "남자1":
        console.log(1);
    break;
}


let 과일 = "배";

switch(과일){
    case "바나나":
    case "참외":
        console.log("노랑")
    break;
    case "사과":
        console.log("빨강")
    break;
    case "키위":
    case "수박":
        console.log("초록")
    break;
    case "포도":
        console.log("보라")
    break;
    default:
        console.log("입력되지않는 과일입니다.")
}

if (과일=="바나나" || 과일=="참외") {

} else if(과일=="사과"){

} else if(과일=="키위" || 과일=="수박"){

} else if(과일=="포도"){

} else {
    
}
