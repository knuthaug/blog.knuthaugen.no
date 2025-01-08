require 'jekyll/tagging'


Jekyll::Hooks.register :site, :post_read do |page|
  value = `pnpm build`
  puts "#{value}"
end