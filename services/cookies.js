'use server'
import { cookies } from "next/headers";

async function setCookies(name, value){
    const cookieStore = await cookies();
    cookies().set({
        name: name,
        value: value,
        httpOnly: true,
    });
}

async function deleteCookies(name){
    const cookieStore = await cookies();
    cookieStore.delete(name);
}

async function hasCookies(name){
    const cookieStore = await cookies();
    return cookieStore.has(name);
}

async function getCookies(name){
    const cookieStore = await cookies();
    return cookieStore.get(name);
}

export {setCookies, hasCookies, deleteCookies, getCookies};
