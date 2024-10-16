{
  description = "Description for the project";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.treefmt-nix.flakeModule
      ];
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];

      perSystem = { config, self', inputs', pkgs, lib, system, ... }: {
        treefmt.config = {
          projectRootFile = "flake.nix";
          programs.nixpkgs-fmt.enable = true;
        };

        packages.web = pkgs.stdenv.mkDerivation {
          pname = "qianmian-web";
          src = ./.;
          version = "0.1.2";
          nativeBuildInputs = with pkgs; [ bun nodejs ];
          buildPhase = ''
            bun install --frozen-lockfile
            bun run build
            mkdir -p $out/web
            cp -r dist/* $out/web
          '';
        };


        packages.default = config.packages.web;

        devShells = {
          dev = pkgs.mkShell {
            name = "qianmian";

            packages = with pkgs; [
              bun
              nodejs

              surrealdb
              surrealdb-migrations
            ];
            # See https://community.flake.parts/haskell-flake/devshell#composing-devshells
            inputsFrom = [
              config.treefmt.build.devShell
            ];
          };
        };
      };
      flake = {
        # The usual flake attributes can be defined here, including system-
        # agnostic ones like nixosModule and system-enumerating ones, although
        # those are more easily expressed in perSystem.
      };
    };
}
