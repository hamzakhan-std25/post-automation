// import { useState } from "react"

// export default function App() {
//   const [data, setData] = useState('')



//   const fetchData = async () => {


//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch("http://localhost:5173/mock-api/events.json")
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const result = await response.json();


//       console.log(result)

//     } catch (err) {
//       console.log('error :', err)
//     }
//   }

//   return (
//     <div className="p-4">
//       App page
//       <div className="py-4">
//         <h3 className="text-black uppercase font-bold px-4 py-2 rounded-lg bg-amber-200" >events</h3>
//       </div>
//       <button
//         onClick={() => { fetchData() }}
//         className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
//       >
//         Load events
//       </button>
//     </div>
//   )
// }



import React from 'react'

export default function App() {
  return (
    <div>
      app.js
    </div>
  )
}
