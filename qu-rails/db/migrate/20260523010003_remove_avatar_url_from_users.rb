# avatar_url はどこからも参照されておらず、アバターはアイコン表示に統一したため削除する。
class RemoveAvatarUrlFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :avatar_url, :string
  end
end
