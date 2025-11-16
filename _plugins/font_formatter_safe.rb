require 'rouge'
module Rouge
  module Formatters
    class FontFormatter < Rouge::Formatters::HTML

      def initialize(opts)
      end

      # this is the main entry method. override this to customize the behavior of
      # the HTML blob as a whole. it should receive an Enumerable of (token, value)
      # pairs and yield out fragments of the resulting html string. see the docs
      # for the methods available on Token.
      def stream(tokens, &block)
        puts tokens.inspect
        return "<code class='language-plaintext highlighter-rouge'>#{block}</code>" unless block_given?
        yield '<pre class="font-highlight"><code class="inner-syntax">'

        tokens.each do |token, value|
          yield value
        end

        yield "</code></pre>"
      end
    end
  end
end