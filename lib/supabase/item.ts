// Project Info API
export async function getItemById(id: string | undefined): Promise<{ id: string }[] | null> {
  if (!id) return null;

  try {
    const res = await fetch(`/api/items?id=${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// export async function createEventGame(eventGame: EventGameProps): Promise<ResultProps> {
//   try {
//     const url = `${EVENT_GAME_BASE_URL}`
//     console.log(url)
//     const res = await fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(eventGame),
//     });
//     const data = await res.json();

//     return data
//   } catch (err){
//     console.log(err);
//     throw err;  
//   }
// }