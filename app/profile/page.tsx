import {AuthGate} from '@/components/tpu/auth-gate';
import {Profile} from '@/components/tpu/account-pages';
export default function Page(){return <AuthGate><Profile/></AuthGate>}
