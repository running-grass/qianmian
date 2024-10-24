<template>
  <div class="flex flex-col items-center w-full h-full">

    <h1 class="py-20 text-5xl">千面知识管理系统</h1>
    <section class="flex-1 text-center">

      <p>基于一个通用的数据结构</p>
      <p>构建多个上层应用，可以做到数据互通</p>

      <p class="py-4">
        <RouterLink :to="{ name: 'login' }" class="text-blue-500">去登录</RouterLink>
      </p>
    </section>
    <footer class="w-full text-center py-4 bg-gray-400 flex justify-center">
      <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备2024089620号-2</a>
      <img src="/public/static/icon/beian.png" class="ml-4 mr-2 w-4 object-contain">
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11011502038341" rel="noreferrer"
        target="_blank">京公网安备11011502038341</a>
    </footer>
  </div>
</template>
