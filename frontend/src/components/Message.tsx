export default function Message({text,bot}:{text:string,bot:boolean}){

  return(
    <div className={`p-3 rounded max-w-xl ${
      bot ? "bg-slate-700":"bg-blue-600 self-end"
    }`}>
      {text}
    </div>

  )
}
