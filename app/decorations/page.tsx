import {AuthGate} from '@/components/tpu/auth-gate';
import Header from '@/components/tpu/header';
import DecorationShop from '@/components/tpu/decoration-shop';
export default function Page(){return <AuthGate><Header/><main className="subpage"><a className="btn outline" href="/land">MY LAND</a><DecorationShop/></main></AuthGate>}
