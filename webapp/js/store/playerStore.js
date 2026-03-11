let bestScore = 9999;

export function saveScore(score){

if(score < bestScore){
bestScore = score;
}

}

export function getBestScore(){
return bestScore;
}