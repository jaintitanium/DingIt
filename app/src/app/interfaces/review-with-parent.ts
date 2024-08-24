import { Tables } from "@custom-types/supabase"

export interface reviewWithParent extends Tables<'review_service_member'> {
    parent: reviewWithUser,
    review_tip_total: number | null
}
export interface reviewWithUser extends Tables<'review'> {
    user: Tables<'user'> | null
}