import { Tables } from "@custom-types/supabase"

export interface reviewWithParent extends Tables<'review_service_member'> {
    parent: reviewWithUser
}
export interface reviewWithUser extends Tables<'review'> {
    user: Tables<'user'> | null
}