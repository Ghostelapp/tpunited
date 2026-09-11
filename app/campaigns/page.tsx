import {AuthGate} from '@/components/tpu/auth-gate';
import Campaigns from '@/components/tpu/campaigns';
export default function Page(){return <AuthGate><Campaigns/></AuthGate>}
