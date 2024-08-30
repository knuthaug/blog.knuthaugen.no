require "rubygems"
require 'rake'
require 'yaml'
require 'time'

SOURCE = "."
CONFIG = {
  'version' => "0.2.13",
  'themes' => File.join(SOURCE, "_includes", "themes"),
  'layouts' => File.join(SOURCE, "_layouts"),
  'posts' => File.join(SOURCE, "_posts"),
  'post_ext' => "md",
  'theme_package_version' => "0.1.0"
}

module TempFixForRakeLastComment
  def last_comment
    last_description
  end 
end
Rake::Application.send :include, TempFixForRakeLastComment

# Usage: rake post title="A Title" [date="2012-02-09"]
desc "Begin a new post in #{CONFIG['posts']}"
task :post do
  abort("rake aborted: '#{CONFIG['posts']}' directory not found.") unless FileTest.directory?(CONFIG['posts'])
  title = ENV["title"] || "new-post"
  slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
  begin
    date = (ENV['date'] ? Time.parse(ENV['date']) : Time.now).strftime('%Y-%m-%d')
  rescue Exception => e
    puts "Error - date format must be YYYY-MM-DD, please check you typed it correctly!"
    exit -1
  end
  filename = File.join(CONFIG['posts'], "#{date}-#{slug}.#{CONFIG['post_ext']}")
  if File.exist?(filename)
    abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  end

  puts "Creating new post: #{filename}"
  open(filename, 'w') do |post|
    post.puts "---"
    post.puts "layout: post"
    post.puts "title: \"#{title.gsub(/-/,' ')}\""
    post.puts "published: false"
    post.puts "tags: []"
    post.puts "---"
  end
end # task :post

desc "Launch preview environment"
task :preview do
  system "jekyll serve --liveReload"
end # task :preview

desc "Build site"
task :build do
  system "jekyll build"
end # task :build


task :deploy => [:build] do
  exec("rsync -e ssh -a _site/ knuthaugen@login.domeneshop.no:www/blog/")
  #exec("ssh knuthaugen@login.domeneshop.no cd www/blog && for name in `find . -mindepth 2 -name index.html -printf '%P\n'`; do base=`echo $name | cut -f1-3 -d'/'`; rm $base.html; cp $name $base.html; done");
end


def ask(message, valid_options)
  if valid_options
    answer = get_stdin("#{message} #{valid_options.to_s.gsub(/"/, '').gsub(/, /,'/')} ") while !valid_options.include?(answer)
  else
    answer = get_stdin(message)
  end
  answer
end


def get_stdin(message)
  print message
  STDIN.gets.chomp
end

